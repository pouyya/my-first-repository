import { DBBasedEntity } from '@simplepos/core/dist/model/dbBasedEntity';    

export class AccountSetting extends DBBasedEntity {
    public name: string;
    public receiptFooterMessage: string;
    public taxType: boolean;
    public screenAwake: boolean;
    public trackEmployeeSales: boolean;
    public isInitialized: boolean;
    public defaultTax: string;
    public taxEntity: string;
    public defaultIcon: Icon;
    public timeOffset: any;
    public saleNumberPrefix: string;
    public saleLastNumber: number = 0;
    public closureNumberPrefix: string;
    public closureLastNumber: number = 0;

    constructor(){
      super();
      this.isInitialized = false;
    }
}

class Icon {
    public name: string;
    public type: string;
    public noOfPaths: number;
}