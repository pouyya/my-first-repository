import { PurchasableItem } from './purchasableItem';

export class Product implements PurchasableItem {
    constructor() {
        this._id = "";
        this._rev = "";
        this.name = "";
        this.color = "";
        this.image = "";
        this.type = "product";
    }

    public _id: string;
    public _rev: string;
    public type: "product";
    public name: string;
    public price: number;
    public color: string;
    public image: string;
}
