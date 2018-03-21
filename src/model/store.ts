import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';
import {DisplayColumn, FilterType, SearchFilter} from "../metadata/listingModule";

export class Store extends DBBasedEntity {
  @DisplayColumn(1) @SearchFilter(FilterType.Text, 1, 'Search')
  public name: string;
  public address: string;
  public orderNumPrefix: string;
  public orderNum: number;
  public street: string;
  public suburb?: string;
  public city?: string;
  public postCode?: string;
  public state: string;
  public country: string;
  public email: string;
  public phone: string;
  public printerIP: string;
  public printerPort: number;
  public taxFileNumber: string;
  public twitter?: string;
  public timezone?: string;
  public supplierReturnPrefix?: string;
  public supplierReturnNum?: number;
  public defaultSaleTaxId: string;
  public trackEmployeeSales: boolean;
  public printReceiptAtEndOfSale: boolean;
}