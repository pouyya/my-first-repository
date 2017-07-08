import {DBBasedEntity} from './dbBasedEntity';
import {BucketItem} from './bucketItem';

interface PaymentsInterface {
  type: string,
  amount: number
}

export class Sale extends DBBasedEntity {

  public posID: string;
  public items: Array<BucketItem>;
  public subTotal: number;
  public tax: number;
  public taxTotal: number;
  public notes: string;
  public completed: boolean;
  public totalDiscount: number;
  public state: string;
  public payments: Array<PaymentsInterface>;
  public round: number;
  public created: string;
  public completedAt: string;
  public status: string;
  public receiptNo: string;
  public customerName: string;
  public originalSalesId: string;

  constructor() {
    super();
    this.completed = false;
    this.items = [];
    this.totalDiscount = 0;
    this.state = 'current'; // [ current, parked, discarded, refund, completed ]
    this.payments = [];
    this.notes = "";
    this.round = 0;
    this.created = new Date().toISOString();
    this.customerName = "";
    this.receiptNo = "";
    this.originalSalesId = "";
  }
}