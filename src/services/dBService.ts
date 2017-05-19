import * as PouchDB from 'pouchdb';
import pouchDBFind from 'pouchdb-find';
import { DBBasedEntity } from "../model/DBBasedEntity"; 
import { ConfigService } from "./configService"

export class DBService<T extends DBBasedEntity> {
    private _db;

    constructor(private entityType) {
        PouchDB.plugin(pouchDBFind);

        var currentInternalDBName = ConfigService.currentInternalDBName();

        this._db = new PouchDB(currentInternalDBName);
        
        //TODO AZ - To change below functions to have proper action (e.g. on going offline show popover that you are offline or such) and log the value 
        // in proper logger!
        var sync = PouchDB.sync(currentInternalDBName ,ConfigService.getCurrentFullExternalDBUrl() , {
        live: true,
        retry: true
        }).on('change', function (info) {
        // handle change
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


        if(ConfigService.isDevelopment())
        {
            PouchDB.debug.enable('*');
            window["PouchDB"] = PouchDB;            
        }

        // this._db.changes({ live: true, since: 'now', include_docs: true})
        //     .on('change', this.onDatabaseChange);        

        this._db.createIndex({
            index: {fields: ['entityTypeName', 'entityTypeNames', 'categoryIDs']}
        });        
    }

    add(entity : T) {  
        var model: any;
        model = JSON.stringify(entity);
        return this._db.post(model);
    }

    update(entity : T) {
        var model: any;
        model = JSON.stringify(entity);
        return this._db.put(model);
      
    }

    delete(entity : T) {  
        return this._db.remove(entity._id, entity._rev);
    }

    getAll() {  
        var entityTypeName = (new this.entityType()).entityTypeName;
        
        return this._db.find({ selector: {entityTypeName: entityTypeName}, include_docs: true})
        .then(docs => { return docs.docs; });
    }
    
    findBy(selector) {
        return this._db.find(selector)
        .then(docs => { return docs.docs; });
    }
}