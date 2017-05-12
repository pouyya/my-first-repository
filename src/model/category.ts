import { DBBasedEntity } from './dbBasedEntity';


export class Category implements DBBasedEntity
{
    constructor() 
    {
        this._id = "";
        this._rev ="";
        this.type= "category";
        this.isUsed = false;
    
    }

    public _id: string;
    public _rev: string;
    public type: "category";
    public isUsed: boolean;
}
