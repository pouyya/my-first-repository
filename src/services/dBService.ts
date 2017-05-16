import { Injectable } from '@angular/core';
import * as PouchDB from 'pouchdb';
import pouchDBFind from 'pouchdb-find';
import { DBBasedEntity } from "../model/DBBasedEntity"; 
import { ConfigService } from "./configService"

@Injectable()
export class DBService<T extends DBBasedEntity> {  
    private _db;
    private _entities;

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
        }

        this._db.createIndex({
            index: {fields: ['type']}
        });        
    }

    add(entity : T) {  

        return this._db.post(entity);
    }

    update(entity : T) {  
        
        return this._db.put(entity);
      
    }

    delete(entity : T) {  
        return this._db.remove(entity._id, entity._rev);
    }

    getAll() {  
        var entityTypeName = (new this.entityType()).entityTypeName.toLowerCase();
        
        // if (!this._entities) {
            return this._db.find({ selector: {type: entityTypeName}, include_docs: true})
                .then(docs => {

                    this._entities = docs.docs;

                    // Listen for changes on the database.
                    this._db.changes({ live: true, since: 'now', include_docs: true})
                        .on('change', this.onDatabaseChange);
                        
                    return this._entities;
                });
    }
    
    IsCategoryUsed(item){
         
       return this._db.find({selector: {type: "category", isUsed:true, _id:item._id}})
            .then(function(result){
                if(result){
                    return true;
                     
                }else{
                    return false;
                }
                
            }).catch(function(err){
                console.log(err);
            });
    }
    
    private onDatabaseChange = (change) => {  

        // console.log('===============change=======', change);

        var index = this.findIndex(this._entities, change.id);
        var product = this._entities[index];

        console.log("==========Change Doc======", product, change.doc);

        if (change.deleted) {
            if (product) {
                this._entities.splice(index, 1); // delete
            }
        } else {
            // change.doc.Date = new Date(change.doc.Date);
              
            if (product && product._id === change.id) {
                console.log("Update Document=====", change.doc);
                this._entities[index] = change.doc; // update
            } else if (change.doc.type && change.doc.type === product.type) {
                console.log("Insert Document=====", change.doc);
                this._entities.splice(index, 0, change.doc) // insert
            }
        }
    }

    // Binary search, the array is by default sorted by _id.
    private findIndex(array, id) {  
        var low = 0, high = array.length, mid;
        while (low < high) {
        mid = (low + high) >>> 1;
        array[mid]._id < id ? low = mid + 1 : high = mid
        }
        return low;
    }


}