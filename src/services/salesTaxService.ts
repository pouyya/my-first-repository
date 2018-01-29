import { Injectable } from '@angular/core';
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { PriceBookService } from './priceBookService';
import { GroupSalesTaxService } from './groupSalesTaxService';
import { SalesTax } from './../model/salesTax';
import { UserService } from '../modules/dataSync/services/userService';

@Injectable()
export class SalesTaxService extends BaseEntityService<SalesTax> {

  static readonly noSalesTaxId: string = 'no_sales_tax';

  constructor(private userService: UserService,
              private groupSalesTaxService: GroupSalesTaxService,
              private priceBookService: PriceBookService) {
    super(SalesTax);
  }

  /**
   * Process everything related to sales tax deletion
   * @param tax
   * @returns {Promise<T>}
   */
  public processDeletion(tax: SalesTax): Promise<any> {
    return new Promise((resolve, reject) => {
      let promises: Array<Promise<any>> = [];
      promises.push(this.groupSalesTaxService.removeSalesTaxFromGroups(tax));
      promises.push(this.priceBookService.setPriceBookItemTaxToDefault(tax._id));

      Promise.all(promises)
        .then(() => resolve()).catch(error => reject(error));
    });
  }
}