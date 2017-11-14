import { BaseRoleModule } from './baseRoleModule';

export class ProductsPageRoleModule extends BaseRoleModule {

  public associatedPage: string = 'Products';
  public roles: string[] = ['Products'];

}