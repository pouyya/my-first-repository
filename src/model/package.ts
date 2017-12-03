import { PurchasableItem } from './purchasableItem';

export class Package extends PurchasableItem
{
    constructor() 
    {
        super();
        this.name = "";
        this.color = "";
        this.image = "";
    }

    public name: string;
    public color: string;
    public image: string;
}
