import PouchDB from 'pouchdb';
import pouchDBFind from 'pouchdb-find';
import { DBBasedEntity } from "../model/DBBasedEntity";
import { ConfigService } from "./configService"
import { NgZone } from '@angular/core';

export class DBService<T extends DBBasedEntity> {
    private static _db;

    static initialize() {

        if (DBService._db == null) {
            PouchDB.plugin(pouchDBFind);
            var currentInternalDBName = ConfigService.currentInternalDBName();
            DBService._db = new PouchDB(currentInternalDBName);

            //TODO AZ - To change below functions to have proper action (e.g. on going offline show popover that you are offline or such) and log the value 
            // in proper logger!
            PouchDB.sync(currentInternalDBName, ConfigService.getCurrentFullExternalDBUrl(), {
                live: true,
                retry: true
            }).on('change', function (info) {
                //changed
            }).on('paused', function (err) {
                // replication paused (e.g. replication up to date, user went offline)
            }).on('active', function () {
                // replicate resumed (e.g. new changes replicating, user went back online)
            }).on('denied', function (err) {
                // a document failed to replicate (e.g. due to permissions)
            }).on('complete', function (info) {
                // handle complete
            }).on('error', function (err) {
                // handle error
            });

            if (ConfigService.isDevelopment()) {
                PouchDB.debug.enable('*');
                window["PouchDB"] = PouchDB;
            }
            else {
                PouchDB.debug.disable()
            }

            DBService._db.createIndex({
                index: { fields: ['entityTypeName', 'entityTypeNames', 'categoryIDs'] }
            });

        }
    }

    constructor(private entityType, private zone: NgZone) {

        DBService.initialize();
    }

    getDB() {
        return DBService._db;
    }

    add(entity: T) {
        if (!entity._id) {
            entity._id = new Date().toISOString();
        }
        return this.update(entity);
    }

    update(entity: T) {
        return this.get(entity._id).then(result => {
            entity._rev = result._rev;
            return DBService._db.put(entity).then(function (resultAfterUpdate) {
                entity._rev = resultAfterUpdate.rev;
            });
        }, error => {
            if (error.status == "404") {
                return DBService._db.put(entity);
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

    async getAll() : Promise<Array<T>> {
        var entityTypeName = (new this.entityType()).entityTypeName;
        var result = await DBService._db.find({ selector: { entityTypeName: entityTypeName }, include_docs: true });
        if(result && result.docs){
            return result.docs;
        }
        return result;
    }

    findBy(selector: any) {
        var entityTypeName = (new this.entityType()).entityTypeName;
        selector.entityTypeName = entityTypeName;
        return DBService._db.find(selector)
            .then(docs => { return docs.docs; });
    }

    get(id) {
        return DBService._db.get(id);
    }
}