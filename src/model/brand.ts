import { DBBasedEntity } from '@simplepos/core/dist/model/dbBasedEntity';
import {DisplayColumn, SearchFilter, FilterType} from "../metadata/listingModule";

export class Brand extends DBBasedEntity {
  @DisplayColumn(1) @SearchFilter(FilterType.Text, 1, 'Search')
  public name: string;
  public updatedAt: string;
}