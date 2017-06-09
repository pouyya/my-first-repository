import {DBBasedEntity} from './dbBasedEntity';

export class POS extends DBBasedEntity {

  public storeId: string;
  public name: string;
  public receiptTemplate: string;
  public number: number;
  public prefix: string;
  public suffix: string;
  public emailReceipt: boolean;
  public printReceipt: boolean;
  public askForNote: string;
  public printNoteOnReceipt: boolean;
  public showDiscount: boolean;
  public selectUserForNextSale: boolean;
  public status: boolean;

  constructor() {
    super();
    //defaults
    this.emailReceipt = true;
    this.printReceipt = true;
    this.printNoteOnReceipt = true;
    this.showDiscount = true;
    this.selectUserForNextSale = false;
    this.status = true;
  }

}