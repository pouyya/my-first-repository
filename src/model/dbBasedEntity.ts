
import { TypeHelper } from "../utility/typeHelper";

export abstract class DBBasedEntity
{
    constructor()
    {
        this._id = "";
        this._rev = "";
        this.entityTypeName = TypeHelper.getTypeName(this);
    }

    public _id: string;
    public _rev: string;
    public readonly entityTypeName: string;
}