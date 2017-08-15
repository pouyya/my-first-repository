import { UserService } from './userService';
import { Injectable, NgZone } from '@angular/core';
import { Store } from '../model/store'
import { BaseEntityService } from './baseEntityService';
import { PosService } from "./posService";
import { SalesServices } from "./salesService";
import { POS } from "../model/pos";
import { Sale } from "../model/sale";

@Injectable()
export class StoreService extends BaseEntityService<Store> {
  constructor(private zone: NgZone,
              private userService: UserService,
              private posService: PosService,
              private salesService: SalesServices) {
    super(Store, zone);
  }

  public getDefaultTax(): Promise<any> {
    let user = this.userService.getLoggedInUser();
    return this.findBy({
      selector: { _id: user.settings.currentStore },
      fields: ["defaultSaleTaxId"]
    });
  }

  public update(store: Store): Promise<any> {
    return new Promise((resolve, reject) => {
      super.update(store).then(() => {
        // persist user
        let user = this.userService.getLoggedInUser();
        if (store._id == user.settings.currentStore) {
          user.currentStore = store;
          user.settings.currentStore = store._id;
          this.userService.persistUser(user);
        }
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   * Delete Store, with all associations if option turned on
   * @param store
   * @param associated
   * @returns {Promise<any>}
   */
  public delete(store: Store, associated: boolean = false): Promise<any> {
    let user = this.userService.getLoggedInUser();
    if (user.settings.currentStore == store._id) {
      return Promise.reject({
        error: 'DEFAULT_STORE_EXISTS',
        error_msg: 'This is your current store. Please switch to other one before deleting it.'
      });
    } else {
      if (!associated) return super.delete(store);

      // delete all associations
      return new Promise((resolve, reject) => {
        let invoiceId = localStorage.getItem('invoice_id');
        this.posService.findBy({ selector: { storeId: store._id } }).then((registers: Array<POS>) => {
          if(registers.length > 0) {
            let posDeletions: Array<Promise<any>> = [];
            registers.forEach((register) => {
              this.salesService.findBy({ selector: { posId: register._id } }).then((sales: Array<Sale>) => {
                if(sales.length > 0) {
                  let salesDeletion: Array<Promise<any>> = [];
                  sales.forEach(sale => {
                    if(invoiceId && invoiceId == sale._id) localStorage.removeItem('invoice_id');
                    salesDeletion.push(this.salesService.delete(sale));
                  });
                  Promise.all(salesDeletion).then(() => {
                    // transfer control back to outer loop
                    posDeletions.push(this.posService.delete(register));
                  });
                } else {
                  posDeletions.push(this.posService.delete(register));
                }
              }).catch(error => posDeletions.push(Promise.resolve()));
            });

            Promise.all(posDeletions).then(() => {
              super.delete(store).then(() => resolve()).catch(error => reject(error));
            }).catch(error => reject(error));
          } else {
            super.delete(store).then(() => resolve()).catch(error => reject(error));
          }
        }).catch(error => reject(error));
      });
    }
  }
}