import { BaseRoleModule } from './baseRoleModule';

export class BackOfficePageRoleModule extends BaseRoleModule {

  public associatedPage = 'HomePage';
  public roles = ['BackOffice'];

}