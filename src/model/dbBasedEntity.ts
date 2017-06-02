
import { TypeHelper } from "../utility/typeHelper";

export abstract class DBBasedEntity
{
    constructor()
    {
        this._id = "";
        this._rev = "";
        this.entityTypeName = TypeHelper.getTypeName(this);
        this.entityTypeNames = TypeHelper.getParentTypeNames(this);
    }

    public _id: string;
    public _rev: string;
    public _deleted: boolean;
    public readonly entityTypeName: string;
    public readonly entityTypeNames: Array<string>;
}