import { EventEmitter } from '@angular/core';
import { ConfigService } from '../services/configService';
import { PouchDBProvider } from '../provider/pouchDBProvider';

export class DB {

    constructor(private dbSyncProgress: EventEmitter<any>) {
    }

    private _db: any;
    private pendingMax = 0;

    public async initialize() {
        if (this._db == null) {
            this._db = PouchDBProvider.createDb(ConfigService.internalDBName);
            this.pendingMax = await PouchDBProvider.getPendingMax(ConfigService.currentFullExternalDBUrl);
            this._db.sync(ConfigService.currentFullExternalDBUrl, {
                live: true,
                retry: true
            }).on('change', (info) => {
                if (info.direction == "pull") {
                    var progress = PouchDBProvider.getProgress(info.change, this.pendingMax);
                    if (progress == 0) {
                        this.pendingMax = 0;
                    }

                    this.dbSyncProgress.emit(progress);
                }
            }).on('paused', (err) => {
                // replication paused (e.g. replication up to date, user went offline)
                this.dbSyncProgress.emit(1);
            }).on('active', function () {
                // replicate resumed (e.g. new changes replicating, user went back online)
            }).on('denied', function (err) {
                // a document failed to replicate (e.g. due to permissions)
            }).on('error', function (err) {
                // handle error
            });

            this._db.createIndex({
                index: { fields: ['entityTypeName', 'entityTypeNames', 'categoryIDs'] }
            });
        }
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
}