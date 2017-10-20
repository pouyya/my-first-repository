import { DBBasedEntity } from "../model/dbBasedEntity";
import { DBService } from "./DBService";

export abstract class BaseEntityService<T extends DBBasedEntity>
{
    private _dbService;
    private _type;

    constructor(type: { new (): T; }) {
        this._dbService = new DBService<T>(type);
        this._type = type;
    }

    getDB() {
        return this._dbService.getDB();
    }

    add(entity: T) {
        
        var entityCopy = new this._type();

        for (var k in entity) entityCopy[k] = entity[k];

        this.clearAllMethods(entityCopy);

        return this._dbService.add(entityCopy);
    }

    update(entity: T) {
        return this._dbService.update(entity);
    }

    delete(entity: T) {
        return this._dbService.delete(entity);
    }

    getAll() : Promise<Array<T>> {
        return this._dbService.getAll();
    }

    findBy(selector: any) {
        return this._dbService.findBy(selector);
    }

    get(id: any) {
        return this._dbService.get(id);
    }

    async getFirst() {
        var result = await this._dbService.getAll();

        if(result != null && Array.isArray(result))
        {
            return result[0]
        }

        return null;
    }

    private clearAllMethods(entity: T) {
        if (entity) {
            for (var m in entity) {
                if (typeof entity[m] == "function") {
                    delete entity[m];
                }
            }
        }
    }
}
