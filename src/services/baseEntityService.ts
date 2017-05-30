import { NgZone } from '@angular/core';
import { DBBasedEntity } from "../model/dbBasedEntity";
import { DBService } from "./DBService";

export abstract class BaseEntityService<T extends DBBasedEntity>
{
    private _dbService;
    private _type;

    constructor(type: { new(): T ;}, zone : NgZone) {
        this._dbService = new DBService<T>(type, zone);
        this._type  = type;
    }

    add(entity : T) {  
        var entityCopy = new this._type();
        
        for(var k in entity)  entityCopy[k]=entity[k];

        return this._dbService.add(entityCopy);
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

    findBy(selector: any) {
        return this._dbService.findBy(selector);
    }

    get(id: any) {
        return this._dbService.get(id);
    }

    put(id: string, entity: T) {
        return this._dbService.put(id, entity);
    }
}