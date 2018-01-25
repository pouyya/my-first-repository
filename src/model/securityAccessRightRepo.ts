import { AccessRightItem, AccessRightItemID } from './accessItemRight';

export class SecurityAccessRightRepo {

  /**
   * @AccessRight
   * Can view all employees
   */
  public static EmployeeListing: AccessRightItem = new AccessRightItem(
    AccessRightItemID.EmployeeListing,
    'Employee Listing');

  /**
   * @AccessRIght
   * Can Add/Edit employee
   */
  public static EmployeeAddEdit: AccessRightItem = new AccessRightItem(
    AccessRightItemID.EmployeeAddEdit,
    'Employee Add/Edit');

  /**
   * @AccessRight
   * Can view all stores
   */
  public static StoreListing: AccessRightItem = new AccessRightItem(
    AccessRightItemID.StoreListing,
    'Store Listing');

  /**
   * @AccessRight
   * Can Add/Edit store
   */
  public static StoreAddEdit: AccessRightItem = new AccessRightItem(
    AccessRightItemID.StoreAddEdit,
    'Store Add/Edit');

  /**
   * Holds all the Access Right Items 
   */
  public static readonly Repo: AccessRightItem[] = [
    SecurityAccessRightRepo.EmployeeAddEdit,
    SecurityAccessRightRepo.EmployeeListing,
    SecurityAccessRightRepo.StoreAddEdit,
    SecurityAccessRightRepo.StoreListing
  ];

}