import { PluginService } from './pluginService';
import { Sale } from './../model/sale';
import { SalesServices } from './salesService';
import { POS } from './../model/pos';
import { Store } from './../model/store';
import { PosService } from './posService';
import { Injectable, Inject, forwardRef } from "@angular/core";
import { SalesTaxService } from "./salesTaxService";
import { GroupSalesTaxService } from "./groupSalesTaxService";
import { SalesTax } from "../model/salesTax";
import { GroupSaleTax } from "../model/groupSalesTax";

@Injectable()
export class AppService {
  constructor(private salesTaxService: SalesTaxService,
    private groupSalesTaxService: GroupSalesTaxService,
    private posService: PosService,
    private pluginService: PluginService,
    @Inject(forwardRef(() => SalesServices)) private salesService: SalesServices) {
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

  public deleteStoreAssociations(store: Store) {
    return new Promise((resolve, reject) => {
      let invoiceId = localStorage.getItem('invoice_id');
      this.posService.findBy({ selector: { storeId: store._id } }).then((registers: Array<POS>) => {
        if (registers.length > 0) {
          let posDeletions: Array<Promise<any>> = [];
          registers.forEach((register) => {
            this.salesService.findBy({ selector: { posId: register._id } }).then((sales: Array<Sale>) => {
              if (sales.length > 0) {
                let salesDeletion: Array<Promise<any>> = [];
                sales.forEach(sale => {
                  if (invoiceId && invoiceId == sale._id) localStorage.removeItem('invoice_id');
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

          Promise.all(posDeletions).then(() => resolve()).catch(error => reject(error));
        } else {
          resolve();
        }
      }).catch(error => reject(error));
    });
  }

  /**
   * Delete POS Associations -> [Sale]
   * @param posId 
   */
  public deletePos(pos: POS): Promise<any> {
    return new Promise((resolve, reject) => {
      this.salesService.findBy({ selector: { posId: pos._id } }).then((sales: Array<Sale>) => {
        if (sales.length > 0) {
          let salesDeletion: Array<Promise<any>> = [];
          sales.forEach(sale => {
            salesDeletion.push(this.salesService.delete(sale));
          });
          Promise.all(salesDeletion).then(() => {
            this.posService.delete(pos)
              .then(() => resolve())
              .catch(error => reject(error));
          }).catch(error => reject(error));
        } else this.posService.delete(pos)
          .then(() => resolve())
          .catch(error => reject(error));
      }).catch(error => reject(error));
    });
  }

  public errorHandler(error) {
    this.pluginService.openDialoge(error).catch(e => {
      throw new Error(e);
    })    
  }
}
