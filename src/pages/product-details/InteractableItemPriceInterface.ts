import { PurchasableItemPriceInterface } from './../../model/purchasableItemPrice.interface';

export interface InteractableItemPriceInterface {
	id: string;
	tax: any;
	item: PurchasableItemPriceInterface;
	isDefault: boolean;
}