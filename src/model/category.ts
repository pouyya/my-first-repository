import { DBBasedEntity } from './dbBasedEntity';


export class Category implements DBBasedEntity
{
    constructor() 
    {
        this._id = "";
        this._rev ="";
        this.type= "category";
    }

    public _id: string;
    public _rev: string;
    public type: "category";
}
