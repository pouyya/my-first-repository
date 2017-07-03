import * as PouchDB from 'pouchdb';
import pouchDBFind from 'pouchdb-find';
import { DBBasedEntity } from "../model/DBBasedEntity";
import { ConfigService } from "./configService"
import { NgZone } from '@angular/core';

export class DBService<T extends DBBasedEntity> {
    private _db;
    private _data: Array<T>;

    constructor(private entityType, private zone: NgZone) {
        PouchDB.plugin(pouchDBFind);

        var currentInternalDBName = ConfigService.currentInternalDBName();

        this._db = new PouchDB(currentInternalDBName);
        this._data = new Array<T>();

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

        this._db.changes({ live: true, since: 'now', include_docs: true }).on('change', (change) => {
            this.handleChange(change);
        });


        if (ConfigService.isDevelopment()) {
            PouchDB.debug.enable('*');
            window["PouchDB"] = PouchDB;
        }

        this._db.createIndex({
            index: { fields: ['entityTypeName', 'entityTypeNames', 'categoryIDs'] }
        });
    }

    add(entity: T) {
        if(!entity._id)
        {
            entity._id = new Date().toISOString();
        }
        return this.update(entity);
    }

    update(entity: T) {
        return this.get(entity._id).then(result => {
            entity._rev = result._rev;
            return this._db.put(entity).then(function(resultAfterUpdate) 
            { 
                entity._rev = resultAfterUpdate.rev;   
            });
        }, error => {
            if (error.status == "404") {
                return this._db.put(entity);
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

    getAll(raw: boolean = false) {
        var entityTypeName = (new this.entityType()).entityTypeName;
        return this._db.find({ selector: { entityTypeName: entityTypeName }, include_docs: true })
            .then(docs => {
                if(raw) {
                    return docs;
                } else {
                    this._data = docs.docs;
                    return this._data;
                }
            });
    }

    findBy(selector) {
        return this._db.find(selector)
            .then(docs => { return docs.docs; });
    }

    get(id) {
        return this._db.get(id);
    }

    handleChange(change) {
        this.zone.run(() => {

            if (change.doc && change.doc.entityTypeName === (new this.entityType()).entityTypeName) {
                let changedDoc = null;
                let changedIndex = null;

                this._data.forEach((doc, index) => {

                    if (doc._id === change._id) {
                        changedDoc = doc;
                        changedIndex = index;
                    }
                });

                //A document was deleted
                if (change.deleted) {
                    this._data.splice(changedIndex, 1);
                }
                else {

                    //A document was updated
                    if (changedDoc) {
                        this._data[changedIndex] = change.doc;
                    }
                    //A document was added
                    else {
                        this._data.push(change.doc);
                    }
                }
            }
        });
    }
}