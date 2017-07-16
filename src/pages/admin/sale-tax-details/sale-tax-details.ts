import { SalesTaxService } from './../../../services/salesTaxService';
import { Platform, NavParams, NavController } from 'ionic-angular';
import { SalesTax } from './../../../model/salesTax';
import { Component } from '@angular/core';

@Component({
  selector: "sale-tax-details",
  templateUrl: "sale-tax-details.html"
})
export class SaleTaxDetails {

  public tax: SalesTax;
  public isNew: boolean;
  public action: string;

  constructor(
    private platform: Platform,
    private navParams: NavParams,
    private salesTaxService: SalesTaxService,
    private navCtrl: NavController
  ) {
    this.tax = new SalesTax();
    this.isNew = true;
    this.action = 'Add';
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      let tax = this.navParams.get('tax');
      if (tax) {
        this.tax = tax;
        this.isNew = false;
        this.action = 'Edit';
      }
    }).catch(console.error.bind(console));
  }

  public upsert() {
    this.salesTaxService[this.isNew ? 'add' : 'update'](this.tax).then(() => {
      this.navCtrl.pop();
    }).catch((error) => {
      throw new Error(error);
    });
  }

}