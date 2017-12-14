import { OrderableInterface } from './orderableInterface';
import { DBBasedEntity } from './dbBasedEntity';

export abstract class PurchasableItem extends DBBasedEntity implements OrderableInterface
{
    public name: string;
    public color: string;
    public image: string;
    public inStock?: number | boolean;
    public icon: any;
    public order: number;
    public barcode?: string;
    public sku?: string; // stock keeping unit
}