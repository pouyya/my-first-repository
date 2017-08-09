import _ from 'lodash';
import { Injectable, NgZone } from '@angular/core';
import { BaseEntityService } from './baseEntityService';
import { PriceBookService } from './priceBookService';
import { GroupSalesTaxService } from './groupSalesTaxService';
import { UserService } from './userService';
import { SalesTax } from './../model/salesTax';
import { AppSettingsService } from "./appSettingsService";

@Injectable()
export class SalesTaxService extends BaseEntityService<SalesTax> {

  static readonly noSalesTaxId: string = 'no_sales_tax';

  constructor(private zone: NgZone,
              private userService: UserService,
              private groupSalesTaxService: GroupSalesTaxService,
              private priceBookService: PriceBookService,
              private appSettingsService: AppSettingsService) {
    super(SalesTax, zone);
  }

  /**
   * Process everything related to sales tax deletion
   * @param tax
   * @returns {Promise<T>}
   */
  public processDeletion(tax: SalesTax): Promise<any> {
    return new Promise((resolve, reject) => {
      let user = this.userService.getLoggedInUser();
      let promises: Array<Promise<any>> = [];
      promises.push(this.groupSalesTaxService.removeSalesTaxFromGroups(tax));
      if (tax._id === user.settings.defaultTax) promises.push(this.appSettingsService.setDefaultTaxToNoTax());
      promises.push(this.priceBookService.setPriceBookItemTaxToDefault(tax._id));

      Promise.all(promises)
        .then(() => resolve()).catch(error => reject(error));
    });
  }
}