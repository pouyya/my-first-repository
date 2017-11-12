import { BaseRoleModule } from './baseRoleModule';

export class SettingsPageRoleModule extends BaseRoleModule {
  
  public associatedPage: string = 'Settings';

  public roles: string[] = [
    'Settings',
    /* CanEdit */
  ];

}