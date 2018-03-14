import { OrderableInterface } from './orderableInterface';
import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';

export class Category extends DBBasedEntity implements OrderableInterface {
  public name: string;
  public icon: any;
  public order: number;
  public color: string;

  constructor() {
    super();
    this.order = 0;
  }
}