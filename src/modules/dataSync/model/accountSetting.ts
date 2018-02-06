import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';    

export class AccountSetting extends DBBasedEntity {
    public name: string;
    public receiptFooterMessage: string;
    public taxType: boolean;
    public screenAwake: boolean;
    public trackEmployeeSales: boolean;
    public defaultTax: string;
    public taxEntity: string;
    public defaultIcon: Icon;
    public timeOffset: string;
    public saleNumberPrefix: string;
    public saleLastNumber: number = 0;
    public closureNumberPrefix: string;
    public closureLastNumber: number = 0;
}

class Icon {
    public name: string;
    public type: string;
    public noOfPaths: number;
}