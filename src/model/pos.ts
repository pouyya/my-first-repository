import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';

export interface CashMovement {
  amount: number,
  type: string,
  note?: string,
  datetime: Date
}

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
  public status: boolean = false;
  public openTime: string;
  public openingAmount: number = 0;
  public openingNote: string;
  public cashMovements: Array<CashMovement>;

  constructor() {
    super();
    this.cashMovements = [];
  }
}