import {DBBasedEntity} from './dbBasedEntity';
import {Store} from './store';

enum ROLES {
  STAFF = 0,
  MANAGER = 1,
  ADMIN = 2
}

export class Employee extends DBBasedEntity {

  public firstName: string;
  public lastName: string;
  public address: string;
  public phone: number;
  public store: Array<{ store: Store, role: ROLES }>;
}