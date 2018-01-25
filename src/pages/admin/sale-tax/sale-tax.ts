import _ from 'lodash';
import { GroupSaleTaxPage } from './../group-sale-tax/group-sale-tax';
import { SaleTaxDetails } from './../sale-tax-details/sale-tax-details';
import { Platform, NavController, ToastController } from 'ionic-angular';
import { SalesTax } from './../../../model/salesTax';
import { SalesTaxService } from './../../../services/salesTaxService';
import { Component, NgZone } from '@angular/core';
import { SettingsModule } from '../../../modules/settingsModule';
import { PageModule } from '../../../metadata/pageModule';

@PageModule(() => SettingsModule)
@Component({
  selector: 'sale-tax-page',
  templateUrl: 'sale-tax.html'
})
export class SaleTaxPage {

  public salesTaxes: Array<SalesTax> = [];

  constructor(
    private salesTaxService: SalesTaxService,
    private platform: Platform,
    private zone: NgZone,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {

  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.salesTaxService.getAll().then((taxes: Array<SalesTax>) => {
        this.zone.run(() => {
          let noSalesTax: SalesTax = taxes.splice(_.findIndex(taxes, { _id: "no_sales_tax" }), 1)[0];
          this.salesTaxes = [noSalesTax].concat(taxes);
        });
      }).catch((error) => {
        throw new Error(error);
      });
    }).catch(console.error.bind(console));
  }

  public upsert(tax?: SalesTax) {
    if(!tax || tax._id != "no_sales_tax") {
      let args: Array<any> = [SaleTaxDetails, { tax } || false];
      this.navCtrl.push.apply(this.navCtrl, args);
    }
  }

  public gotoGroupSalesTax() {
    this.navCtrl.push(GroupSaleTaxPage);
  }

}