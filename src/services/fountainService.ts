import { StoreService } from './storeService';
import { UserService } from './userService';
import { Injectable, Injector } from '@angular/core';

@Injectable()
export class FountainService {

  private storeService: StoreService;

  constructor(
    private injector: Injector,
    private userService: UserService
  ) {
    setTimeout(() => this.storeService = injector.get(StoreService));
  }

  public getReceiptNumber() {
    let user = this.userService.getLoggedInUser();
    user.currentStore.saleLastNumber++;
    this.userService.persistUser(user);
    this.storeService.get(user.currentStore._id).then((store) => {
      store.saleLastNumber = user.currentStore.saleLastNumber
      this.storeService.update(store)
    });
    
    return `${user.currentStore.saleNumberPrefix}${user.currentStore.saleLastNumber}`;
  }

}