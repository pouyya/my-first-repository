import { DBBasedEntity } from '@simplepos/core/dist/model/dbBasedEntity';
import { DisplayColumn, FilterType, SearchFilter } from "../metadata/listingModule";
import { Required, Regex } from "../metadata/validationModule";

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
    characterPerLine?: number;
    associatedPurchasableItemIds: string[]
}

export interface CashMovement {
    amount: number,
    type: string,
    employeeId: string,
    note?: string,
    datetime: Date
}

interface IProductCategorySort {
    [id: string]: string[];
}
interface IProductColor {
    [id: string]: string;
}

export class POS {
    public id: string;
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
    public categorySort: string[];
    public categoryColor: IProductColor;
    public productColor: IProductColor;
    public productCategorySort: IProductCategorySort;
    public cashMovements: Array<CashMovement>;

    constructor() {
        this.cashMovements = [];
        this.categorySort = [];
        this.productCategorySort = {};
    }
}

export class Store extends DBBasedEntity {
    @DisplayColumn(1) @SearchFilter(FilterType.Text, 1, 'Search')
    @Required()
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
    @Regex("^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$")
    public email: string;
    public phone: string;
    public printerIP: string;
    public printerPort: number;
    public taxFileNumber: string;
    public twitter?: string;
    public facebook?: string;
    public instagram?: string;
    public timezone?: string;
    public supplierReturnPrefix?: string;
    public supplierReturnNum?: number;
    public defaultSaleTaxId: string;
    public trackEmployeeSales: boolean;
    public printReceiptAtEndOfSale: boolean;
    public receiptHeaderMessage: string;
    public receiptFooterMessage: string;
    public devices: Device[];
    public POS: POS[];

    constructor() {
        super();
        this.POS = [];
    }

}