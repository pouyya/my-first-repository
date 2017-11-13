import { DBBasedEntity } from "../model/dbBasedEntity";
import { DBService } from "./DBService";

export abstract class BaseEntityService<T extends DBBasedEntity>
{
    private _dbService;
    private _type;

    constructor(type: { new (): T; }) {
        this._type = type;
    }

    get dbService() {
        if(!this._dbService){
            this._dbService = new DBService<T>(this._type);
        }

        return this._dbService;
    }

    getDB() {
        return this.dbService.getDB()
    }

    add(entity: T) {
        
        var entityCopy = new this._type();

        for (var k in entity) entityCopy[k] = entity[k];

        this.clearAllMethods(entityCopy);

        return this.dbService.add(entityCopy);
    }

    update(entity: T) {
        return this.dbService.update(entity);
    }

    delete(entity: T) {
        return this.dbService.delete(entity);
    }

    getAll() : Promise<Array<T>> {
        return this.dbService.getAll();
    }

    findBy(selector: any) {
        return this.dbService.findBy(selector);
    }

    get(id: any) {
        return this.dbService.get(id);
    }

    async getFirst() {
        var result = await this.dbService.getAll();

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
