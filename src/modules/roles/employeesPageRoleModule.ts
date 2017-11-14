import { BaseRoleModule } from './baseRoleModule';

export class EmployeesPageRoleModule extends BaseRoleModule {

  public associatedPage: string = 'Employees';
  public roles: string[] = ['Employees'];

}