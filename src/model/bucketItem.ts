import { PurchasableItemPriceInterface } from './purchasableItemPrice.interface';

export class BasketItem {
  _id: string;
  _rev?: string;
  name: string;
  quantity: number;
  discount: number;
  actualPrice: number;
  finalPrice: number;
  notes: string;
  priceBook?: PurchasableItemPriceInterface;
  tax: any;
  isTaxIncl?: boolean;
  employeeId?: string | null;
  cssClass: string | null;
}