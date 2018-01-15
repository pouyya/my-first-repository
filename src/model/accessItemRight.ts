export enum AccessItemRightID {
  EmployeeAddEdit = 'EmployeeAddEdit',
  EmployeeListing = 'EmployeeListing',
  StoreAddEdit = 'StoreAddEdit',
  StoreListing = 'StoreListing'
}

export class AccessItemRight {

  public id: AccessItemRightID;
  public name: string;
  public description?: string;

  constructor(id: AccessItemRightID, name: string, description?: string) {
    this.id = id;
    this.name = name;
    description && (this.description = description);
  }

}