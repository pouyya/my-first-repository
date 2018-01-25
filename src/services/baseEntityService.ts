import { DBBasedEntity } from "../model/dbBasedEntity";
import { DBService } from "./dBService";
import * as _ from "lodash";

export enum SortOptions {
  DESC = 'desc',
  ASC = 'asc'
}

export interface QuerySelectorInterface {
  [selector: string]: any;
}

export interface QueryOptionsInterface {
  conditionalSelectors?: QuerySelectorInterface;
  sort?: Array<{ [selector: string]: SortOptions }>;
}

export abstract class BaseEntityService<T extends DBBasedEntity> {
  private _dbService;
  private _type;

  constructor(type: { new(): T; }) {
    this._type = type;
  }

  get dbService() {
    if (!this._dbService) {
      this._dbService = new DBService<T>(this._type);
    }

    return this._dbService;
  }

  getDB() {
    return this.dbService.getDB()
  }

  add(entity: T) {
    let entityCopy = new this._type();
    for (let k in entity) entityCopy[k] = entity[k];
    this.clearAllMethods(entityCopy);
    return this.dbService.add(entityCopy);
  }

  update(entity: T): Promise<T> {
    return this.dbService.update(entity);
  }

  delete(entity: T) {
    return this.dbService.delete(entity);
  }

  getAll(): Promise<Array<T>> {
    return this.dbService.getAll();
  }

  findBy(selector: any): Promise<Array<T>> {
    return this.dbService.findBy(selector);
  }
  
  query(selector: any): Promise<Array<any>> {
    return this.dbService.query(selector);
  }

  get(id: any): Promise<T> {
    return this.dbService.get(id);
  }

  public search(limit: number = 10, skip: number = 0, selectors?: QuerySelectorInterface, options?: QueryOptionsInterface): Promise<Array<T>> {
		
		var query: any = {
			selector: {}
		};

		_.each(selectors, (value, key) => {
			if (value && value != null) {
				var regexp = new RegExp(`.*${value}.*`, 'i');
				query.selector[key] = { $regex: regexp };
			}
		});

		query.limit = limit;
    query.skip = skip;
    if(options) {
      options.hasOwnProperty('sort') && (query.sort = options.sort);
      if(options.hasOwnProperty('conditionalSelectors') && Object.keys(options.conditionalSelectors).length > 0) {
        _.each(options.conditionalSelectors, (value, key) => {
          query.selector[key] = typeof value == 'string' ? value.trim() : value;
        });
      }
    }

		return this.findBy(query);
	}

  private clearAllMethods(entity: T) {
    if (entity) {
      for (let m in entity) {
        if (entity.hasOwnProperty(m) && typeof entity[m] == "function") {
          delete entity[m];
        }
      }
    }
  }
}
