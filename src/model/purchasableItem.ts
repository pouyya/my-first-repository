import { DBBasedEntity } from './dbBasedEntity';

export abstract class PurchasableItem extends DBBasedEntity 
{
    public name: string;
    public price: number;
    public color: string;
    public image: string;
}