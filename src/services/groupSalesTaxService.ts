import { UserService } from './userService';
import { GroupSaleTax } from './../model/groupSalesTax';
import { Injectable, NgZone } from '@angular/core';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class GroupSalesTaxService extends BaseEntityService<GroupSaleTax> {

  constructor(private zone: NgZone, private userService: UserService) {
    super(GroupSaleTax, zone);
  }

  public getForUser(userId?: string): Promise<any> {
    if (!userId) {
      let user = this.userService.getLoggedInUser();
      userId = user._id;
    }

    return this.findBy({ selector: { userId } });
  }

}