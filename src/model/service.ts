import { PurchasableItem } from './purchasableItem';

export class Service extends PurchasableItem
{
    constructor() 
    {
        super();
        this.name = "";
        this.color = "";
        this.image = "";
    }

    public name: string;
    public price: number;
    public color: string;
    public image: string;
}
