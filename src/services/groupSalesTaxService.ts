import _ from 'lodash';
import { Injectable, NgZone } from '@angular/core';
import { BaseEntityService } from './baseEntityService';
import { GroupSaleTax } from './../model/groupSalesTax';
import { PriceBookService } from './priceBookService';
import { UserService } from './userService';
import { SalesTax } from './../model/salesTax';
import { AppSettingsService } from './appSettingsService';

@Injectable()
export class GroupSalesTaxService extends BaseEntityService<GroupSaleTax> {

  constructor(
    private zone: NgZone,
    private priceBookService: PriceBookService,
    private userService: UserService,
    private appSettingsService: AppSettingsService
  ) {
    super(GroupSaleTax, zone);
  }

  /**
   * Remove tax from group sales tax
   * @param tax
   * @returns {Promise<T>}
   */
  public removeSalesTaxFromGroups(tax: SalesTax): Promise<any> {
    return new Promise((resolve, reject) => {
      this.findBy({
        selector: {
          salesTaxes: {
            $elemMatch: {
              _id: { $eq: tax._id }
            }
          }
        }
      }).then((groupSalesTaxes: Array<GroupSaleTax>) => {
        if (groupSalesTaxes.length > 0) {
          let promises: Array<Promise<any>> = [];
          groupSalesTaxes.forEach((group: GroupSaleTax) => {
            let idx = _.findIndex(group.salesTaxes, { _id: tax._id });
            group.rate -= tax.rate; // minus the tax rate as well
            group.salesTaxes.splice(idx, 1);
            promises.push(this.update(group));
          });
          Promise.all(promises).then(() => resolve())
            .catch((error) => reject(error));
        } else {
          resolve();
        }
      }).catch((error) => reject(error));
    });
  }

  /**
   * Process everything related to group sales tax deletion
   * @param tax
   * @returns {Promise<T>}
   */
  public processDeletion(tax: GroupSaleTax): Promise<any> {
    return new Promise((resolve, reject) => {
      let user = this.userService.getLoggedInUser();
      let promises: Array<Promise<any>> = [];
      if (tax._id === user.settings.defaultTax) promises.push(this.appSettingsService.setDefaultTaxToNoTax());
      promises.push(this.priceBookService.setPriceBookItemTaxToDefault(tax._id));
      Promise.all(promises)
        .then(() => resolve()).catch(error => reject(error));
    });
  }

}