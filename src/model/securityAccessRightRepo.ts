import { AccessRightItem } from './accessItemRight';

export class SecurityAccessRightRepo {

  public static ServiceAddEdit: AccessRightItem = new AccessRightItem(
    'ServiceAddEdit',
    'Service Add/Edit');

  public static ServiceListing: AccessRightItem = new AccessRightItem(
    'ServiceListing',
    'Service Listing');

  public static InventoryCategory: AccessRightItem = new AccessRightItem(
    'InventoryCategory',
    'Inventory Category');

  public static BackOfficeDashboard: AccessRightItem = new AccessRightItem(
    'BackOfficeDashboard',
    'BackOffice Dashboard');

  public static HumanResourceDashboard: AccessRightItem = new AccessRightItem(
    'HumanResourceDashboard',
    'HumanResource Dashboard');

  public static CustomerListing: AccessRightItem = new AccessRightItem(
    'CustomerListing',
    'Customer Listing');

  public static CustomerAddEdit: AccessRightItem = new AccessRightItem(
    'CustomerAddEdit',
    'Customer Add/Edit');

  public static PriceBookListing: AccessRightItem = new AccessRightItem(
    'PriceBookListing',
    'PriceBook Listing');

  public static PriceBookAddEdit: AccessRightItem = new AccessRightItem(
    'PriceBookAddEdit',
    'PriceBook Add/Edit');

  public static StaffsTimeLogs: AccessRightItem = new AccessRightItem(
    'StaffsTimeLogs',
    'Staffs Time Logs');

  public static ProductListing: AccessRightItem = new AccessRightItem(
    'ProductListing',
    'Product Listing');

  public static ProductAddEdit: AccessRightItem = new AccessRightItem(
    'ProductAddEdit',
    'Product Add/Edit');

  public static SupplierListing: AccessRightItem = new AccessRightItem(
    'SupplierListing',
    'Supplier Listing');

  public static SupplierAddEdit: AccessRightItem = new AccessRightItem(
    'SupplierAddEdit',
    'Supplier Add/Edit');

  public static EmployeeListing: AccessRightItem = new AccessRightItem(
    'EmployeeListing',
    'Employee Listing');

  public static EmployeeAddEdit: AccessRightItem = new AccessRightItem(
    'EmployeeAddEdit',
    'Employee Add/Edit');

  public static BrandListing: AccessRightItem = new AccessRightItem(
    'BrandListing',
    'Brand Listing');

  public static BrandAddEdit: AccessRightItem = new AccessRightItem(
    'BrandAddEdit',
    'Brand Add/Edit');

  public static StoreListing: AccessRightItem = new AccessRightItem(
    'StoreListing',
    'Store Listing');

  public static StoreAddEdit: AccessRightItem = new AccessRightItem(
    'StoreAddEdit',
    'Store Add/Edit');

  public static DeleteAccount: AccessRightItem = new AccessRightItem(
    'DeleteAccount',
    'Delete Account');

  public static readonly RoleListing: AccessRightItem = new AccessRightItem(
    'RoleListing',
    'Role Add/Edit');

  public static readonly RoleAddEdit: AccessRightItem = new AccessRightItem(
    'RoleAddEdit',
    'Role Add/Edit');

  public static readonly Settings: AccessRightItem = new AccessRightItem(
    "Settings",
    "Access Settings");

  public static readonly AboutPage: AccessRightItem = new AccessRightItem(
    "AboutPage",
    "About Page");

  public static readonly OpenCloseRegister: AccessRightItem = new AccessRightItem(
    "OpenCloseRegister",
    "Open/Close Register");

  public static readonly MoneyInOut: AccessRightItem = new AccessRightItem(
    "MoneyInOut",
    "Money In/Out");

  public static readonly GroupSaleTax: AccessRightItem = new AccessRightItem(
    "GroupSaleTax",
    "Group Sale Tax");

  public static readonly SaleTax: AccessRightItem = new AccessRightItem(
    "SaleTax",
    "Sale Tax");

  public static readonly OpenCashDrawer: AccessRightItem = new AccessRightItem(
    "OpenCashDrawer",
    "Open Cash Drawer");

  public static readonly SwitchPos: AccessRightItem = new AccessRightItem(
    "SwitchPos",
    "Switch Pos");

    public static ReportsDashboard : AccessRightItem = new AccessRightItem(
      'ReportsDashboard',
      'Reports Dashboard');

    public static ReportStockMovementSummary : AccessRightItem = new AccessRightItem(
      'ReportStockMovementSummary',
      'Report Stock Movement Summary');

    public static ReportStaffAttendance : AccessRightItem = new AccessRightItem(
      'ReportStaffAttendance',
      'Report Staff Attendance');
      
    public static Preferences : AccessRightItem = new AccessRightItem(
      'Preferences',
      'Preferences');

    public static Roster: AccessRightItem = new AccessRightItem(
      'Roster',
      'Roster');
      
  public static readonly Repo: AccessRightItem[] = [
    SecurityAccessRightRepo.ServiceAddEdit,
    SecurityAccessRightRepo.ServiceListing,
    SecurityAccessRightRepo.InventoryCategory,
    SecurityAccessRightRepo.BackOfficeDashboard,
    SecurityAccessRightRepo.HumanResourceDashboard,
    SecurityAccessRightRepo.EmployeeAddEdit,
    SecurityAccessRightRepo.EmployeeListing,
    SecurityAccessRightRepo.StoreAddEdit,
    SecurityAccessRightRepo.StoreListing,
    SecurityAccessRightRepo.RoleListing,
    SecurityAccessRightRepo.RoleAddEdit,
    SecurityAccessRightRepo.Settings,
    SecurityAccessRightRepo.CustomerListing,
    SecurityAccessRightRepo.CustomerAddEdit,
    SecurityAccessRightRepo.PriceBookListing,
    SecurityAccessRightRepo.PriceBookAddEdit,
    SecurityAccessRightRepo.StaffsTimeLogs,
    SecurityAccessRightRepo.AboutPage,
    SecurityAccessRightRepo.BrandListing,
    SecurityAccessRightRepo.BrandAddEdit,
    SecurityAccessRightRepo.ProductListing,
    SecurityAccessRightRepo.ProductAddEdit,
    SecurityAccessRightRepo.SupplierListing,
    SecurityAccessRightRepo.SupplierAddEdit,
    SecurityAccessRightRepo.OpenCloseRegister,
    SecurityAccessRightRepo.GroupSaleTax,
    SecurityAccessRightRepo.MoneyInOut,
    SecurityAccessRightRepo.SaleTax,    
    SecurityAccessRightRepo.OpenCashDrawer,
    SecurityAccessRightRepo.SwitchPos,
    SecurityAccessRightRepo.ReportsDashboard,
    SecurityAccessRightRepo.ReportStockMovementSummary,
    SecurityAccessRightRepo.ReportStaffAttendance,
    SecurityAccessRightRepo.Preferences,
    SecurityAccessRightRepo.DeleteAccount,
    SecurityAccessRightRepo.Roster
  ];

}