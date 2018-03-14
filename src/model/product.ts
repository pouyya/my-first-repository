import { PurchasableItem } from './purchasableItem';

export class Product extends PurchasableItem {

  public stockControl: boolean;
  public barcode?: string;
  public sku?: string; // stock keeping unit
  public brandId: string; // Brand Model
  public supplierId?: string; // Supplier
  public tag: string;
  public color: string;

  constructor() {
    super();
    this.order = 0;
    this.stockControl = false;
  }

}