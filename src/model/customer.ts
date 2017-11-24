import { DBBasedEntity } from './dbBasedEntity';

/*
Firstname (string, 100) - validation: One of firstname or last name should be provided
Lastname (string, 100) - validation: One of firstname or last name should be provided
Date of birth (Date) - date picker that allows to type date as well (DD/MM/YYYY) -> date selector for this is not that much usable as staff need to go back many years
Phone (Free-Text) - just allow "0123456789+-" - allow empty
Email (Free-Text) - validation: if value provided it should be valid email - allow empty
Address (Free-Text) - allow empty
Suburb (Free-Text) - allow empty
Postcode (Free-Text) - allow empty
Country (DDL)
*/

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

}