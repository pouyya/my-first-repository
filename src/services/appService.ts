import { Injectable } from "@angular/core";
import { SalesTaxService } from "./salesTaxService";
import { GroupSalesTaxService } from "./groupSalesTaxService";
import { SalesTax } from "../model/salesTax";
import { GroupSaleTax } from "../model/groupSalesTax";

@Injectable()
export class AppService {
  constructor(private salesTaxService: SalesTaxService,
              private groupSalesTaxService: GroupSalesTaxService) {
  }

  /**
   * Get list of all salesTax and GroupSalesTaxes combined
   * @returns {Promise<T>}
   */
  public loadSalesAndGroupTaxes(): Promise<any> {
    return new Promise((resolve, reject) => {
      let taxes: Array<any> = [];
      this.salesTaxService.getAll().then((_salesTaxes: Array<SalesTax>) => {
        taxes = _salesTaxes.map((salesTax => {
          return { ...salesTax, noOfTaxes: 0 };
        }));
        this.groupSalesTaxService.getAll().then((_groupSalesTaxes: Array<GroupSaleTax>) => {
          taxes = taxes.concat(_groupSalesTaxes.map((groupSaleTax => {
            return { ...groupSaleTax, noOfTaxes: groupSaleTax.salesTaxes.length };
          })));
          resolve(taxes);
        }).catch(error => reject(error));
      }).catch(error => reject(error));
    });
  }
}
