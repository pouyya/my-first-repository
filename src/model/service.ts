import { PurchasableItem } from './purchasableItem';

export class Service implements PurchasableItem
{
    constructor() 
    {
        this._id = "";
        this._rev ="";
        this.name = "";
        this.color = "";
        this.image = "";
        this.type= "service";
    }

    public _id: string;
    public _rev: string;
    public type: "service";
    public name: string;
    public price: number;
    public color: string;
    public image: string;
}
