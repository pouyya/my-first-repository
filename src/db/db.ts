import { EventEmitter } from '@angular/core';
import { PouchDBProvider } from '../provider/pouchDBProvider';
import { DBEvent } from './dbEvent';

export class DB {

    constructor(private dbSyncProgress: EventEmitter<any>) {
    }

    private _db: any;
    private pendingMax = 0;

    public async initialize(dbUrl: string, internalDBName: string) {
        return new Promise(async (resolve) => {

            if (this._db == null) {
                this._db = PouchDBProvider.createDb(internalDBName);
                this.pendingMax = await PouchDBProvider.getPendingMax(dbUrl);
                this._db.sync(dbUrl, {
                    live: true,
                    retry: true
                }).on('change', (info) => {
                    if (info.direction == "pull") {
                        var progress = PouchDBProvider.getProgress(info.change, this.pendingMax);
                        if (progress == 0) {
                            this.pendingMax = 0;
                            resolve();
                        }
                        this.dbSyncProgress.emit(new DBEvent(true, progress));
                    }
                }).on('paused', (err) => {
                    // replication paused (e.g. replication up to date, user went offline)
                    this.dbSyncProgress.emit(new DBEvent(false, 1));
                    resolve();
                }).on('active', (info) => {
                    // replicate resumed (e.g. new changes replicating, user went back online)
                    resolve();
                    this.dbSyncProgress.emit(new DBEvent(true, 0));
                }).on('denied', (err) => {
                    // a document failed to replicate (e.g. due to permissions)
                }).on('complete', (info) => {
                    resolve();
                    this.dbSyncProgress.emit(new DBEvent(false, 1))
                    // handle complete
                }).on('error', (err) => {
                    // handle error
                    this.dbSyncProgress.emit(new DBEvent(false, 1));
                });

                this._db.createIndex({
                    index: { fields: ['entityTypeName', 'entityTypeNames'] }
                });
            }
        });
    }

    public put(entity): Promise<any> {
        return this._db.put(entity);
    }

    public get(id): Promise<any> {
        return this._db.get(id);
    }

    public async find(query): Promise<Array<any>> {
        var result = await this._db.find(query);
        return result.docs;
    }

    public query(view, key): Promise<Array<any>> {
        return this._db.query(view, key);
    }

    public destroy(): Promise<boolean> {
        return this._db.destroy();
    }
}