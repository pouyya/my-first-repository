import { AccessItemRight, AccessItemRightID } from './accessItemRight';

export class SecurityAccessRightRepo {

  /**
   * @AccessRight
   * Can view all employees
   */
  public static EmployeeListing: AccessItemRight = new AccessItemRight(
    AccessItemRightID.EmployeeListing,
    'Employee Listing');

  /**
   * @AccessRIght
   * Can Add/Edit employee
   */
  public static EmployeeAddEdit: AccessItemRight = new AccessItemRight(
    AccessItemRightID.EmployeeAddEdit,
    'Employee Add/Edit');

  /**
   * @AccessRight
   * Can view all stores
   */
  public static StoreListing: AccessItemRight = new AccessItemRight(
    AccessItemRightID.StoreListing,
    'Store Listing');

  /**
   * @AccessRight
   * Can Add/Edit store
   */
  public static StoreAddEdit: AccessItemRight = new AccessItemRight(
    AccessItemRightID.StoreAddEdit,
    'Store Add/Edit');

}