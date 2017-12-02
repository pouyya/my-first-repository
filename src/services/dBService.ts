import { EventEmitter } from '@angular/core';
import { DBBasedEntity } from "../model/DBBasedEntity";
import { DB } from '../db/db';
import { PouchDBProvider } from "../provider/pouchDBProvider";

export class DBService<T extends DBBasedEntity> {

    static pluginInitialized: boolean = false;
    public static criticalDBSyncProgress: EventEmitter<any> = new EventEmitter();
    public static criticalDB: DB;
    private static db: DB;

    constructor(private entityType) {
        DBService.initialize();
    }

    public static initializePlugin() {
        if (!DBService.pluginInitialized) {
            PouchDBProvider.initializePlugin();
            DBService.pluginInitialized = true;
        }
    }

    public static initialize() {
        if (DBService.criticalDB == null) {
            DBService.criticalDB = new DB(this.criticalDBSyncProgress);
            DBService.criticalDB.initialize();
        }

        // if (DBService.db == null) {
        //     DBService.criticalDB = new DB();
        //     DBService.criticalDB.initialize();
        // }
    }

    public getDB(): DB {
        return DBService.criticalDB;
    }

    add(entity: T): Promise<T> {
        if (!entity._id) {
            entity._id = new Date().toISOString();
        }
        return this.update(entity);
    }

    update(entity: T): Promise<T> {
        return this.get(entity._id).then(async result => {
            entity._rev = result._rev;
            var resultAfterUpdate = await this.getDB().put(entity);
            entity._rev = resultAfterUpdate.rev;

            return entity;
        }, error => {
            if (error.status == "404") {
                return this.getDB().put(entity);
            } else {
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            }
        });
    }

    delete(entity: T) {
        entity._deleted = true;
        return this.update(entity);
    }

    async getAll(): Promise<Array<T>> {
        var entityTypeName = (new this.entityType()).entityTypeName;
        return await this.getDB().find({ selector: { entityTypeName: entityTypeName }, include_docs: true });
    }

    findBy(selector: any): Promise<Array<T>> {
        selector.include_docs = true;
        selector.entityTypeName = (new this.entityType()).entityTypeName;
        return this.getDB().find(selector);
    }

    get(id): Promise<T> {
        return this.getDB().get(id);
    }
}
