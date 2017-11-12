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

}

export class Employee extends DBBasedEntity {
  public firstName: string;
  public lastName: string;
  public address: string;
  public phone: string;
  public isAdmin?: boolean;
  public store?: Array<{ id: any, roles: any[] }>;
  public pin: number;
}