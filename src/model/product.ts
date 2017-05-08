import { DBBasedEntity } from './dbBasedEntity';


export class Product implements DBBasedEntity
{
    constructor() 
    {
        this._id = "";
        this._rev ="";
        this.type= "product";
    }

    public _id: string;
    public _rev: string;
    public type: "product";
}
