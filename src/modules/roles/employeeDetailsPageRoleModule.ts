import { BaseRoleModule } from './baseRoleModule';

export class EmployeeDetailsPageRoleModule extends BaseRoleModule {

  public associatedPage: string = 'EmployeeDetails';
  public roles: string[] = ['EmployeeDetails'];

}