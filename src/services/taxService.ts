import { StoreService } from './storeService';
import {Injectable} from '@angular/core';

@Injectable()
export class TaxService {
  private tax: number;

  constructor(private storeService: StoreService) {
    this.storeService.getDefaultTax().then((store: any) => {
      this.tax = Number(store[0].defaultSaleTaxId);
    }).catch((error) => {
      throw new Error(error);
    })
  }

  public getTax() {
    return this.tax;
  }

  public calculate(price: number): number {
    return this.tax > 0 ? price + ((this.tax / 100) * price) : price;
  }
}