import { GroupSaleTax } from './../model/groupSalesTax';
import { GroupSalesTaxService } from './groupSalesTaxService';
import { SalesTax } from './../model/salesTax';
import { SalesTaxService } from './salesTaxService';
import { AppSettings } from './../model/appSettings';
import { Injectable, NgZone } from '@angular/core';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class AppSettingsService extends BaseEntityService<AppSettings> {

  constructor(
    private zone: NgZone,
    private salesTaxService: SalesTaxService,
    private groupSalesTaxService: GroupSalesTaxService
  ) {
      super(AppSettings, zone);
  }

  public get() {
    return new Promise((resolve, reject) => {
      super.getAll().then((settings: Array<AppSettings>) => {
        resolve(settings[0]);
      }).catch(error => reject(error));
    });
  }

  public loadSalesAndGroupTaxes(): Promise<any> {
    return new Promise((resolve, reject) => {
      let taxes: Array<any> = [];
      this.salesTaxService.getAll().then((_salesTaxes: Array<SalesTax>) => {
        taxes = _salesTaxes.map((salesTax => {
          return { model: salesTax, entity: salesTax.entityTypeName, noOfTaxes: 0 };
        }));
        this.groupSalesTaxService.getAll().then((_groupSalesTaxes: Array<GroupSaleTax>) => {
          taxes = taxes.concat(_groupSalesTaxes.map((groupSaleTax => {
            return { model: groupSaleTax, entity: groupSaleTax.entityTypeName, noOfTaxes: groupSaleTax.salesTaxes.length };
          })));
          resolve(taxes);
        }).catch(error => reject(error));
      }).catch(error => reject(error));
    });
  }

}