import { AccessRightItem } from './accessItemRight';

export class SecurityAccessRightRepo {

  /**
   * @AccessRight
   * Can view all employees
   */
  public static EmployeeListing: AccessRightItem = new AccessRightItem(
    'EmployeeListing',
    'Employee Listing');

  /**
   * @AccessRIght
   * Can Add/Edit employee
   */
  public static EmployeeAddEdit: AccessRightItem = new AccessRightItem(
    'EmployeeAddEdit',
    'Employee Add/Edit');

  /**
   * @AccessRight
   * Can view all stores
   */
  public static StoreListing: AccessRightItem = new AccessRightItem(
    'StoreListing',
    'Store Listing');

  /**
   * @AccessRight
   * Can Add/Edit store
   */
  public static StoreAddEdit: AccessRightItem = new AccessRightItem(
    'StoreAddEdit',
    'Store Add/Edit');

  /**
   * @AccessRight
   * Can List Roles
   */
  public static readonly RoleListing: AccessRightItem = new AccessRightItem(
    'RoleListing',
    'Role Add/Edit');

  /**
   * @AccessRight
   * Can Add/Edit Roles
   */
  public static readonly RoleAddEdit: AccessRightItem = new AccessRightItem(
    'RoleAddEdit',
    'Role Add/Edit');

  /**
   * @AccessRight
   * Can Access App Settings
   */
  public static readonly Settings: AccessRightItem = new AccessRightItem(
    "Settings",
    "Access Settings");

  /**
   * Holds all the Access Right Items 
   */
  public static readonly Repo: AccessRightItem[] = [
    SecurityAccessRightRepo.EmployeeAddEdit,
    SecurityAccessRightRepo.EmployeeListing,
    SecurityAccessRightRepo.StoreAddEdit,
    SecurityAccessRightRepo.StoreListing,
    SecurityAccessRightRepo.RoleListing,
    SecurityAccessRightRepo.RoleAddEdit,
    SecurityAccessRightRepo.Settings
  ];

}