import { EventEmitter } from '@angular/core';
import PouchDB from 'pouchdb';
import pouchDBFind from 'pouchdb-find';
import { DBBasedEntity } from "../model/DBBasedEntity";
import { ConfigService } from "./configService"

export class DBService<T extends DBBasedEntity> {
    private static _db;
    public static dbSyncProgress: EventEmitter<any> = new EventEmitter();
    private static pendingMax = 0;

    static getProgress(pending) {
        var progress;
        if (DBService.pendingMax > 0) {
            progress = pending / DBService.pendingMax;
            if (pending === 0) {
                DBService.pendingMax = 0;    // reset for live/next replication
            }
        } else {
            progress = 1;  // 100%
        }
        return progress;
    }

    public static async initialize() {

        if (DBService._db == null) {
            PouchDB.plugin(pouchDBFind);
            var currentInternalDBName = ConfigService.internalDBName;
            DBService._db = new PouchDB(currentInternalDBName);

            var currentFullExternalDBUrl = ConfigService.currentFullExternalDBUrl;

            var externalDBInfo = await new PouchDB(currentFullExternalDBUrl).info();
            DBService.pendingMax = Number(externalDBInfo.update_seq.toString().substring(0, externalDBInfo.update_seq.toString().indexOf('-')));

            PouchDB.sync(currentInternalDBName, currentFullExternalDBUrl, {
                live: true,
                retry: true
            }).on('change', function (info) {
                if (info.direction == "pull") {
                    var currentUpdateSeq = Number(info.change.last_seq.toString().substring(0, info.change.last_seq.toString().indexOf('-')));
                    var progress = DBService.getProgress(currentUpdateSeq)
                    DBService.dbSyncProgress.emit(progress);
                }
            }).on('paused', function (err) {
                // replication paused (e.g. replication up to date, user went offline)
                DBService.dbSyncProgress.emit(1);
            }).on('active', function () {
                // replicate resumed (e.g. new changes replicating, user went back online)
            }).on('denied', function (err) {
                // a document failed to replicate (e.g. due to permissions)
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
            return
        }
    }

    constructor(private entityType) {
        DBService.initialize();
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

    async getAll(): Promise<Array<T>> {
        var entityTypeName = (new this.entityType()).entityTypeName;
        var result = await DBService._db.find({ selector: { entityTypeName: entityTypeName }, include_docs: true });
        if (result && result.docs) {
            return result.docs;
        }
        return result;
    }

    async findBy(selector: any) {
        var entityTypeName = (new this.entityType()).entityTypeName;
        selector.entityTypeName = entityTypeName;
        var docs = await DBService._db.find(selector);
        return docs.docs;
    }

    get(id) {
        return DBService._db.get(id);
    }
}
