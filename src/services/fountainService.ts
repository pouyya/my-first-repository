import { UserService } from './userService';
import { Injectable } from '@angular/core';

@Injectable()
export class FountainService {
  constructor(private userService: UserService) {}

  public getReceiptNumber() {
    let user = this.userService.getLoggedInUser();
		user.currentStore.saleLastNumber++;
		this.userService.persistUser(user);
		return `${user.currentStore.saleNumberPrefix}${user.currentStore.saleLastNumber}`;    
  }

}