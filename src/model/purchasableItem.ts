import { OrderableInterface } from './orderableInterface';
import { DBBasedEntity } from './dbBasedEntity';

export abstract class PurchasableItem extends DBBasedEntity implements OrderableInterface
{
    public name: string;
    public price: number;
    public color: string;
    public image: string;
    public discount?: number;
    public inStock?: number | boolean;
    public icon: any;
    public order: number;
}