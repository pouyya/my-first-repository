import { DBBasedEntity } from './dbBasedEntity';


export class Service implements DBBasedEntity
{
    constructor() 
    {
        this._id = "";
        this._rev ="";
        this.type= "service";
    }

    public _id: string;
    public _rev: string;
    public type: "service";
}
