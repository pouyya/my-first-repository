import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';
import {DisplayColumn, FilterType, SearchFilter} from "../metadata/listingModule";


export class Customer extends DBBasedEntity {

  public firstName: string;
  public lastName: string;
  public dob: Date;
  public phone: string;
  public email: string;
  public address: string;
  public suburb: string;
  public postcode: string;
  public country: string;
  @DisplayColumn(1) @SearchFilter(FilterType.Text, 1, 'Search by name')
  public fullname: string;

}