import { ServiceService } from './serviceService';
import { ProductService } from './productService';
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
  constructor(
    private salesTaxService: SalesTaxService,
    private groupSalesTaxService: GroupSalesTaxService,
    private posService: PosService,
    private pluginService: PluginService,
    private productService: ProductService,
    private serviceService: ServiceService,
    @Inject(forwardRef(() => SalesServices)) private salesService: SalesServices) {
  }

  /**
   * Get list of all salesTax and GroupSalesTaxes combined
   * @returns {Promise<T>}
   */
  public async loadSalesAndGroupTaxes(): Promise<any> {
    try {
      let taxes: Array<any> = [];
      let _salesTaxes: SalesTax[] = await this.salesTaxService.getAll();
      taxes = _salesTaxes.map((salesTax => {
        return { ...salesTax, noOfTaxes: 0 };
      }));
      let _groupSalesTaxes: GroupSaleTax[] = await this.groupSalesTaxService.getAll();
      taxes = taxes.concat(_groupSalesTaxes.map((groupSaleTax => {
        return { ...groupSaleTax, noOfTaxes: groupSaleTax.salesTaxes.length };
      })));
      return taxes;
    } catch (err) {
      return Promise.reject(err);
    }
  }
  
  public async deleteStoreAssoc(store: Store) {
    try {
      let assocDeletions: any[] = [
        async () => {
          let saleId = localStorage.getItem('sale_id');
          let registers: POS[] = await this.posService.findBy({ selector: { storeId: store._id } });
          if (registers.length > 0) {
            let posDeletions: Promise<any>[] = [];
            registers.forEach((register) => {
              this.salesService.findBy({ selector: { posId: register._id } }).then((sales: Sale[]) => {
                if (sales.length > 0) {
                  let salesDeletion: Promise<any>[] = [];
                  sales.forEach(sale => {
                    if (saleId && saleId == sale._id) localStorage.removeItem('sale_id');
                    salesDeletion.push(this.salesService.delete(sale));
                  });
                  Promise.all(salesDeletion).then(() => {
                    posDeletions.push(this.posService.delete(register));
                  });
                } else {
                  posDeletions.push(this.posService.delete(register));
                }
              }).catch(error => posDeletions.push(Promise.resolve()));
            });

            return await Promise.all(posDeletions);
          }
          return;
        },
      ];

      return await Promise.all(assocDeletions.map(promise => promise()));

    } catch (err) {
      return Promise.reject(err);
    }
  }

  public deleteStoreAssociations(store: Store) {
    return new Promise((resolve, reject) => {
      let saleId = localStorage.getItem('sale_id');
      this.posService.findBy({ selector: { storeId: store._id } }).then((registers: Array<POS>) => {
        if (registers.length > 0) {
          let posDeletions: Array<Promise<any>> = [];
          registers.forEach((register) => {
            this.salesService.findBy({ selector: { posId: register._id } }).then((sales: Array<Sale>) => {
              if (sales.length > 0) {
                let salesDeletion: Array<Promise<any>> = [];
                sales.forEach(sale => {
                  if (saleId && saleId == sale._id) localStorage.removeItem('sale_id');
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
  public async deletePos(pos: POS): Promise<any> {
    try {
      let sales = await this.salesService.findBy({ selector: { posId: pos._id } });
      if(sales.length > 0) {
        let salesDeletion: Promise<any>[] = [];
        sales.forEach(sale => salesDeletion.push(this.salesService.delete(sale)));
        await Promise.all(salesDeletion);
        await this.posService.delete(pos);
      } else {
        await this.posService.delete(pos);
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  async getAllPurchasableItems() {
    var collect: Promise<any>[] = [
      this.serviceService.getAll(),
      this.productService.getAll()
    ];

    try {
      let [services, products] = await Promise.all(collect);
      let items = services;
      return items.concat(products);
    } catch (error) {
      throw new Error(error);
    }
  }

  public errorHandler(error) {
    this.pluginService.openDialoge(error).catch(e => {
      throw new Error(e);
    })
  }
}
