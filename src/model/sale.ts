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

  constructor() {
    super();
    this.completed = false;
    this.items = [];
    this.totalDiscount = 0;
    this.state = 'current'; // TODO: should be from dynamic source
    this.payments = [];
    this.round = 0;
  }
}