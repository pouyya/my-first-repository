import { Store } from './../model/store';
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

  public getReceiptNumber(store: Store) {
    store.saleLastNumber++;
    this.storeService.update(store); // parallel background update
    return `${store.saleNumberPrefix || ''}${store.saleLastNumber}`;
  }

}