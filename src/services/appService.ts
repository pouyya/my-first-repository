import { ServiceService } from './serviceService';
import { ProductService } from './productService';
import { PluginService } from './pluginService';
import { Sale } from './../model/sale';
import { SalesServices } from './salesService';
import { Store, POS } from './../model/store';
import { Injectable, Inject, forwardRef, Injector } from "@angular/core";
import { SalesTaxService } from "./salesTaxService";
import { GroupSalesTaxService } from "./groupSalesTaxService";
import { SalesTax } from "../model/salesTax";
import { GroupSaleTax } from "../model/groupSalesTax";
import { StoreService } from "./../services/storeService";

@Injectable()
export class AppService {
  private storeService: StoreService;
  constructor(
    private salesTaxService: SalesTaxService,
    private groupSalesTaxService: GroupSalesTaxService,
    private pluginService: PluginService,
    private productService: ProductService,
    private serviceService: ServiceService,
    private injector: Injector,
    @Inject(forwardRef(() => SalesServices)) private salesService: SalesServices) {
      setTimeout(() => {
          this.storeService = this.injector.get(StoreService);
      });
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
          let registers: POS[] = store.POS;
          if (registers.length > 0) {
            let posDeletions: Promise<any>[] = [];
            registers.forEach((register, index) => {
              this.salesService.findBy({ selector: { posId: register.id } }).then((sales: Sale[]) => {
                if (sales.length > 0) {
                  let salesDeletion: Promise<any>[] = [];
                  sales.forEach(sale => {
                    if (saleId && saleId == sale._id) localStorage.removeItem('sale_id');
                    salesDeletion.push(this.salesService.delete(sale));
                  });


                  Promise.all(salesDeletion).then(() => {
                    store.POS.splice(index, 1);
                  });
                } else {
                    store.POS.splice(index, 1);
                }
              }).catch(error => posDeletions.push(Promise.resolve()));
            });

            return await this.storeService.update(store);
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
      if (store.POS.length > 0) {
        let posDeletions: Array<Promise<any>> = [];
          store.POS.forEach((register, index) => {
          this.salesService.findBy({ selector: { posId: register.id } }).then((sales: Array<Sale>) => {
            if (sales.length > 0) {
              let salesDeletion: Array<Promise<any>> = [];
              sales.forEach(sale => {
                if (saleId && saleId == sale._id) localStorage.removeItem('sale_id');
                salesDeletion.push(this.salesService.delete(sale));
              });
              Promise.all(salesDeletion).then(() => {
                // transfer control back to outer loop
                // posDeletions.push(this.posService.delete(register));
                  store.POS.splice(index, 1);
              });
            } else {
              // posDeletions.push(this.posService.delete(register));
                store.POS.splice(index, 1);
            }
          }).catch(error => posDeletions.push(Promise.resolve()));
        });

        this.storeService.update(store).then(() => resolve()).catch(error => reject(error));
      } else {
        resolve();
      }
    });
  }

  /**
   * Delete POS Associations -> [Sale]
   * @param posId 
   */
  public async deletePos(pos: POS): Promise<any> {
    try {
      let sales = await this.salesService.findBy({ selector: { posId: pos.id } });
      if(sales.length > 0) {
        let salesDeletion: Promise<any>[] = [];
        sales.forEach(sale => salesDeletion.push(this.salesService.delete(sale)));
        await Promise.all(salesDeletion);
      }
      await this.storeService.removePOS(pos);

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
