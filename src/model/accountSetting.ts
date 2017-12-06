import { DBBasedEntity } from "./dbBasedEntity";

export class AccountSetting extends DBBasedEntity {
    public name: string;
    public receiptFooterMessage: string;
    public taxType: boolean;
    public screenAwake: boolean;
    public trackEmployeeSales: boolean;
    public defaultTax: string;
    public taxEntity: string;
    public defaultIcon: Icon;
    public timeOffset: number;
}

class Icon {
    public name: string;
    public type: string;
    public noOfPaths: number;
}