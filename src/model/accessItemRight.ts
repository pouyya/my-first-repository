export enum AccessRightItemID {
  EmployeeAddEdit = 'EmployeeAddEdit',
  EmployeeListing = 'EmployeeListing',
  StoreAddEdit = 'StoreAddEdit',
  StoreListing = 'StoreListing'
}

export class AccessRightItem {

  public id: AccessRightItemID;
  public name: string;
  public description?: string;

  constructor(id: AccessRightItemID, name: string, description?: string) {
    this.id = id;
    this.name = name;
    description && (this.description = description);
  }

}