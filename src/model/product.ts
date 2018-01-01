import { PurchasableItem } from './purchasableItem';

export class Product extends PurchasableItem {

  public barcode?: string;
  public sku?: string; // stock keeping unit
  public inStock?: number | boolean;
  public brandId: string; // Brand Model
  public supplierId?: string; // Supplier
  public tag: string;

  constructor() {
    super();
    this.order = 0;
  }

}