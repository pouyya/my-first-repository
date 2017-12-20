import { DBBasedEntity } from "../model/dbBasedEntity";
import { DBService } from "./DBService";

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

  update(entity: T) {
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
