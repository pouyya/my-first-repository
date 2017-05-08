import { Injectable } from '@angular/core';
import * as PouchDB from 'pouchdb';
import pouchDBFind from 'pouchdb-find';
import { DBBasedEntity } from "../model/DBBasedEntity"; 

@Injectable()
export class DBService<T extends DBBasedEntity> {  
    private _db;
    private _entities;

    constructor(private type) {
        PouchDB.plugin(pouchDBFind);
        this._db = new PouchDB('SimpleCuts.db');
        
        PouchDB.debug.enable('*');

        this._db.createIndex({
        index: {fields: ['type']}
        });        
    }

    add(entity : T) {  
        return this._db.post(entity);
    }

    update(entity : T) {  
        return this._db.put(entity._id, entity._rev);
    }

    delete(entity : T) {  
        return this._db.remove(entity._id, entity._rev);
    }

    getAll() {  
        var type = (new this.type()).type;
        
        // if (!this._products) {
            return this._db.find({ selector: {type: type}, include_docs: true})
                .then(docs => {

                    // Each row has a .doc object and we just want to send an 
                    // array of birthday objects back to the calling controller,
                    // so let's map the array to contain just the .doc objects.

                    this._entities = docs.docs.map(row => {
                        // Dates are not automatically converted from a string.
                        row.Date = new Date(row.Date);
                        return row;
                    });

                    // Listen for changes on the database.
                    this._db.changes({ live: true, since: 'now', include_docs: true})
                        .on('change', this.onDatabaseChange);

                    return this._entities;
                });
        // } else {
        //     // Return cached data as a promise
        //     return Promise.resolve(this._entities);
        // }
    }

    private onDatabaseChange = (change) => {  
        var index = this.findIndex(this._entities, change.id);
        var product = this._entities[index];

        if (change.deleted) {
            if (product) {
                this._entities.splice(index, 1); // delete
            }
        } else {
            change.doc.Date = new Date(change.doc.Date);
            if (product && product._id === change.id) {
                this._entities[index] = change.doc; // update
            } else {
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