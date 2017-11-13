import {DBBasedEntity} from './dbBasedEntity';

// TODO: Temporary Roles, will be removed later
const Roles: any = {
  'backoffice': 'BackOffice',
  'products': 'Products',
  'productDetails': 'ProductDetails',
  'services': 'Services',
  'serviceDetails': 'ServiceDetails',
  'settings': 'Settings',
  'stores': 'Stores',
  'storeDetails': 'StoreDetails',
  'employees': 'Employees',
  'employeeDetails': 'EmployeeDetails'
};

interface RolesInterface {
  id: string;
  roles: string[];
}

export class Employee extends DBBasedEntity {
  public firstName: string;
  public lastName: string;
  public address: string;
  public phone: string;
  public isAdmin?: boolean;
  public store?: RolesInterface[];
  public pin: number;
}