import { UserService } from './userService';
import { SalesTax } from './../model/salesTax';
import { Injectable, NgZone } from '@angular/core';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class SalesTaxService extends BaseEntityService<SalesTax> {
  constructor(private zone: NgZone, private userService: UserService) {
    super(SalesTax, zone);
  }

  public getUserSalesTax(): Promise<any> {
    let user = this.userService.getLoggedInUser();
    return this.findBy({ selector: { userId: user._id } });
  }
}