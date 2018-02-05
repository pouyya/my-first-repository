import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';


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
  public fullname: string;

}