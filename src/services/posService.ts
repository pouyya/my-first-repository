import { UserService } from './userService';
import { SalesServices } from './salesService';
import { Injectable, NgZone, Injector } from '@angular/core';
import { BaseEntityService } from  './baseEntityService';
import { POS } from './../model/pos';
import { Sale } from './../model/sale';

@Injectable()
export class PosService extends BaseEntityService<POS> {

  private salesService: SalesServices;

  constructor(
    private injector: Injector,
    private zone: NgZone,
    private userService: UserService
  ) {
    super(POS, zone);
    setTimeout(() => this.salesService = injector.get(SalesServices));
  }

  public getCurrentPosID() {
    return this.userService.getUser().settings.currentPos;
  }

  public getCurrentPos() {
    return this.get(this.getCurrentPosID());
  }

  public update(register: POS): Promise<any> {
    return new Promise((resolve, reject) => {
      super.update(register).then(() => {
        // persist user
        let user = this.userService.getLoggedInUser();
        if(register._id == user.settings.currentPos) {
          user.currentPos = register;
          user.settings.currentPos = register._id;
          this.userService.persistUser(user);
        } 
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }

  /**
   *
   * @param pos
   * @param associated
   * @returns {any}
   */
  public delete(pos: POS, associated: boolean = false): Promise<any> {
    let user = this.userService.getLoggedInUser();
    if (user.settings.currentPos == pos._id) {
      return Promise.reject({
        error: 'DEFAULT_POS_EXISTS',
        error_msg: 'This is your current POS. Please switch to other one before deleting it.'
      });
    } else {
      if (!associated) return super.delete(pos);

      return new Promise((resolve, reject) => {
        let invoiceId = localStorage.getItem('invoice_id');
        this.salesService.findBy({ selector: { posId: pos._id } }).then((sales: Array<Sale>) => {
          if(sales.length > 0) {
            let salesDeletion: Array<Promise<any>> = [];
            sales.forEach(sale => {
              if(invoiceId && invoiceId == sale._id) localStorage.removeItem('invoice_id');
              salesDeletion.push(this.salesService.delete(sale));
            });
            Promise.all(salesDeletion).then(() => {
              // transfer control back to outer loop
              super.delete(pos).then(() => resolve()).catch(error => reject());
            });
          } else {
            super.delete(pos).then(() => resolve()).catch(error => reject());
          }
        });
      });
    }
  }
}