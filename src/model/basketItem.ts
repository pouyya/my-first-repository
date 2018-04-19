import { PurchasableItemPriceInterface } from './purchasableItemPrice.interface';
import { BaseTaxIterface } from './baseTaxIterface';

export class BasketItem {
  purchsableItemId: string;
  modifierItems: Array<BasketItem>;
  name: string;
  categoryId: string;
  quantity: number;
  discount: number;
  systemPrice: number;
  manualPrice?: number;
  taxAmount: number;
  finalPrice: number;
  notes: string;
  priceBook?: PurchasableItemPriceInterface;
  tax: BaseTaxIterface;
  isTaxIncl?: boolean;
  employeeId?: string | null;
  cssClass: string | null;
  stockControl: boolean;
  isBumped: boolean;
}