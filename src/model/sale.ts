import {DBBasedEntity} from './dbBasedEntity';
import {BucketItem} from './bucketItem';

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

  constructor() {
    super();
    this.completed = false;
    this.items = [];
    this.totalDiscount = 0;
    this.state = 'parked'; // TODO: should be from dynamic source
  }
}