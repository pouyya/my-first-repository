import {DBBasedEntity} from './dbBasedEntity';

export class POS extends DBBasedEntity {

  public storeId: string;
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
  public status: boolean = true;
}