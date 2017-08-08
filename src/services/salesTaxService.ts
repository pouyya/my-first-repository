import { AppSettings } from './../model/appSettings';
import { AppSettingsService } from './appSettingsService';
import _ from 'lodash';
import { Injectable, NgZone } from '@angular/core';
import { BaseEntityService } from './baseEntityService';
import { PriceBook } from './../model/priceBook';
import { PriceBookService } from './priceBookService';
import { GroupSaleTax } from './../model/groupSalesTax';
import { GroupSalesTaxService } from './groupSalesTaxService';
import { UserService } from './userService';
import { SalesTax } from './../model/salesTax';
import { PurchasableItemPriceInterface } from './../model/purchasableItemPrice.interface';

@Injectable()
export class SalesTaxService extends BaseEntityService<SalesTax> {

  static readonly noSalesTaxId: string = 'no_sales_tax';

  constructor(
    private zone: NgZone,
    private userService: UserService,
    private groupSalesTaxService: GroupSalesTaxService,
    private priceBookService: PriceBookService,
    private appSettingsService: AppSettingsService
  ) {
    super(SalesTax, zone);
  }

  /**
   * Remove sales tax from groups and recalculate their rate
   * @param tax
   * @returns {Promise<T>}
   */
  private removeFromGroups(tax: SalesTax): Promise<any> {
    return new Promise((resolve, reject) => {
      this.groupSalesTaxService.findBy({
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
          groupSalesTaxes.forEach((group: GroupSaleTax, index, array) => {
            let idx = _.findIndex(group.salesTaxes, { _id: tax._id });
            group.rate -= tax.rate; // minus the tax rate as well
            group.salesTaxes.splice(idx, 1);
            promises.push(this.groupSalesTaxService.update(group));
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
   * Remove sales tax from price book before deletion
   * @param tax
   * @returns {Promise<T>}
   */
  private manageAccountTaxAndItemTaxes(tax: SalesTax): Promise<any> {
    return new Promise((resolve, reject) => {
      let user = this.userService.getLoggedInUser();
      // check if this tax is account level default tax
      let applyNoTax: boolean = tax._id === user.settings.defaultTax;
      if (applyNoTax) {
        // delete tax from default tax and update user settings session
        // "2017-07-24T20:38:47.104Z";
        // update settings in background
        this.appSettingsService.get().then((appSettings: AppSettings) => {
          appSettings.defaultTax = SalesTaxService.noSalesTaxId;
          appSettings.taxEntity = "SalesTax";
          this.appSettingsService.update(appSettings).then(() => {
            user.settings.defaultTax = SalesTaxService.noSalesTaxId;
            user.settings.taxEntity = "SalesTax";
            this.userService.persistUser(user);
          });
        });
      }
      // default price book for now
      this.priceBookService.findBy({
        selector: {
          priority: 0,
          purchasableItems: {
            $elemMatch: {
              salesTaxId: { $eq: tax._id }
            }
          }
        }
      }).then((priceBooks: Array<PriceBook>) => {
        if (priceBooks.length > 0) {
          let priceBook: PriceBook = priceBooks[0];
          priceBook.purchasableItems.forEach((item: PurchasableItemPriceInterface) => {
            if (item.salesTaxId == tax._id) {
              item.salesTaxId = null; // reset to default
            }
          });
          this.priceBookService.update(priceBook)
            .then(() => resolve())
            .catch(error => reject(error));
        } else {
          resolve();
        }
      }).catch(error => reject(error));
    });
  }

  /**
   * Process everything related to sales tax deletion
   * @param tax
   * @returns {Promise<T>}
   */
  public processDeletion(tax: SalesTax): Promise<any> {
    return new Promise((resolve, reject) => {
      let promises: Array<Promise<any>> = [
        this.removeFromGroups(tax),
        this.manageAccountTaxAndItemTaxes(tax)
      ];

      Promise.all(promises)
        .then(() => resolve()).catch(error => reject(error));
    });
  }

  /**
   * @returns {Promise<T>}
   */
  public loadSalesAndGroupTaxes(): Promise<any> {
    return new Promise((resolve, reject) => {
      let taxes: Array<any> = [];
      this.getAll().then((_salesTaxes: Array<SalesTax>) => {
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