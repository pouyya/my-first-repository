import { OrderableInterface } from './orderableInterface';
import { DBBasedEntity } from '@simplepos/core/dist/model/dbBasedEntity';
import {DisplayColumn, FilterType, SearchFilter} from "../metadata/listingModule";

export class Category extends DBBasedEntity implements OrderableInterface {
  @DisplayColumn(1) @SearchFilter(FilterType.Text, 1, "Search")
  public name: string;
  public icon: any;
  public order: number;
  public color: string;
  public image: string;
  public thumbnail: string;

  constructor() {
    super();
    this.order = 0;
  }
}