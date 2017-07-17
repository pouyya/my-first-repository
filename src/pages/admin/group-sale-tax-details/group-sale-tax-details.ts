import _ from 'lodash';
import { SalesTax } from './../../../model/salesTax';
import { SalesTaxService } from './../../../services/salesTaxService';
import { Platform } from 'ionic-angular';
import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { GroupSaleTax } from './../../../model/groupSalesTax';

@Component({
  selector: 'group-sale-tax-details',
  templateUrl: 'group-sale-tax-details.html'
})
export class GroupSaleTaxDetailsPage {

  public groupSalesTax: GroupSaleTax = new GroupSaleTax();
  public salesTaxes: Array<SalesTax> = [];
  public selectedSalesTaxes: Array<SalesTax> = [];
  public isNew = true;
  public action = 'Add';

  constructor(
    private navParams: NavParams,
    private platform: Platform,
    private salesTaxService: SalesTaxService
  ) {

  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      let promises: Array<Promise<any>> = [
        new Promise((resolve, reject) => {
          let group = this.navParams.get('group');
          if (group) {
            this.groupSalesTax = group;
            this.isNew = false;
            this.action = 'Edit';
          }
          resolve();
        }),
        new Promise((resolve, reject) => {
          this.salesTaxService.getUserSalesTax().then((taxes: Array<SalesTax>) => {
            this.salesTaxes = _.filter(taxes, (tax) => {
              return tax.entityTypeName === 'SalesTax';
            });
            resolve();
          }).catch(error => {
            reject(error);
          })
        })
      ];

      Promise.all(promises).catch(error => {
        throw new Error(error);
      });

    }).catch(error => {
      throw new Error(error);
    })
  }

  public upsert() {

  }

}