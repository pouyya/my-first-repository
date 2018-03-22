import { PurchasableItem } from './purchasableItem';
import {DisplayColumn, FilterType, SearchFilter} from "../metadata/listingModule";

export class Product extends PurchasableItem {
  @DisplayColumn(1) @SearchFilter(FilterType.Text, 1, "Search by name or SKU/Barcode")
  public name: string;
  public stockControl: boolean;
  @DisplayColumn(2)
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