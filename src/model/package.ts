import { PurchasableItem } from './purchasableItem';

export class Package implements PurchasableItem
{
    constructor() 
    {
        this._id = "";
        this._rev ="";
        this.name = "";
        this.color = "";
        this.image = "";
        this.type = "package";
    }

    public _id: string;
    public _rev: string;
    public type: "package";
    public name: string;
    public price: number;
    public color: string;
    public image: string;
}
