import { DBBasedEntity } from "../model/DBBasedEntity"; 
import { DBService } from "./DBService";

export abstract class BaseEntityService<T extends DBBasedEntity>
{
    private _dbService;
    private _type;

    constructor(type: { new(): T ;}) {
        this._dbService = new DBService<T>(type);
        this._type  = type;
    }

    add(entity : T) {  
        var entotyCopy = new this._type();
        
        for(var k in entity)  entotyCopy[k]=entity[k];

        return this._dbService.add(entotyCopy);
    }

    update(entity : T) {  
        return this._dbService.update(entity);
    }

    delete(entity : T) {  
        return this._dbService.delete(entity);
    }

    getAll() { 
        return this._dbService.getAll();
    }
    IsCategoryUsed(item){
        return this._dbService.IsCategoryUsed(item);
    }
}