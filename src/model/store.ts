import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';
import { DisplayColumn, FilterType, SearchFilter } from "../metadata/listingModule";

export enum DeviceType {
    Bump,
    ProductionLinePrinter,
    ReceiptPrinter
}

export interface Device {
    name: string;
    posIds: string[];
    type: DeviceType;
    ipAddress: string;
    printerPort: number;
    associatedPurchasableItemIds: string[]
}

export interface CashMovement {
    amount: number,
    type: string,
    employeeId: string,
    note?: string,
    datetime: Date
}

export class POS {
    public _id: string;
    public name: string;
    public receiptTemplate: string;
    public number: number;
    public prefix: string;
    public suffix: string;
    public emailReceipt: boolean = true;
    public printReceipt: boolean = true;
    public askForNote: string;
    public printNoteOnReceipt: boolean = true;
    public showDiscount: boolean = true;
    public selectUserForNextSale: boolean = false;
    public status: boolean = false;
    public openTime: string;
    public openingAmount: number = 0;
    public openingNote: string;
    public cashMovements: Array<CashMovement>;

    constructor() {
        this.cashMovements = [];
    }
}

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
  public devices: Device[];
  public POS: POS[]
}