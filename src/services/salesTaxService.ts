import { PurchasableItemPriceInterface } from './../model/purchasableItemPrice.interface';
import { PriceBook } from './../model/priceBook';
import { PriceBookService } from './priceBookService';
import _ from 'lodash';
import { GroupSaleTax } from './../model/groupSalesTax';
import { GroupSalesTaxService } from './groupSalesTaxService';
import { UserService } from './userService';
import { SalesTax } from './../model/salesTax';
import { Injectable, NgZone } from '@angular/core';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class SalesTaxService extends BaseEntityService<SalesTax> {
  constructor(
    private zone: NgZone,
    private userService: UserService,
    private groupSalesTaxService: GroupSalesTaxService,
    private priceBookService: PriceBookService
  ) {
    super(SalesTax, zone);
  }

  public getUserSalesTax(): Promise<any> {
    return new Promise((resolve, reject) => {
      let user = this.userService.getLoggedInUser();
      this.findBy({ selector: { userId: user._id } }).then((salesTaxes: Array<any>) => {
        // TODO: Don't know why but the code is also retrieving GroupSaleTex objects
        resolve(_.filter(salesTaxes, (tax) => {
          return tax.entityTypeName === 'SalesTax';
        }));
      }).catch((error) => {
        reject(error);
      });
    })
  }

  public add(tax: SalesTax) {
    let user = this.userService.getLoggedInUser();
    tax.userId = user._id;
    return super.add(tax);
  }

  public makeDefault(newTax: SalesTax, oldTax: SalesTax): Promise<any> {
    return new Promise((resolve, reject) => {
      oldTax.isDefault = false;
      this.update(oldTax).then(() => {
        newTax.isDefault = true;
        this.update(newTax).then(() => {
          resolve();
        }).catch(error => reject(error));
      }).catch(error => reject(error));
    });
  }

  public removeSalesTaxFromGroups(tax: SalesTax): Promise<any> {
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
            group.salesTaxes.splice(idx, 1);
            promises.push(this.groupSalesTaxService.update(group));
          });
          Promise.all(promises).then(() => resolve(true))
          .catch((error) => reject(error));
        } else {
          resolve(true);
        }
      }).catch((error) => reject(error));
    });
  }

  public removeSalesTaxFromPriceBooks(tax: SalesTax): Promise<any> {
    return new Promise((resolve, reject) => {
      let user = this.userService.getLoggedInUser();
      // for default pricebook for now
      this.priceBookService.findBy({
        selector: {
          purchasableItems: {
            $elemMatch: {
              salesTaxId: { $eq: tax._id }
            }
          }
        }
      }).then((priceBooks: Array<PriceBook>) => {
        if(priceBooks.length > 0) {
          let promises: Array<Promise<any>> = [];
          priceBooks.forEach((priceBook: PriceBook) => {
            priceBook.purchasableItems.forEach((item: PurchasableItemPriceInterface) => {
              if(item.salesTaxId == tax._id) {
                item.salesTaxId = user.settings.defaultTax;
              }
            });
            promises.push(this.priceBookService.update(priceBook));
          });
          Promise.all(promises).then(() => resolve()).catch(error => reject(error));
        } else {
          resolve();
        }
      }).catch(error => reject(error));
    });
  }
}