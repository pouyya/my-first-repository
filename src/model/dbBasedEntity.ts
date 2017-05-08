export abstract class DBBasedEntity
{
    public _id: string;
    public _rev: string;
    abstract type: string;
}