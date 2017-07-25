import { SalesTaxService } from './../../../services/salesTaxService';
import { Platform, NavParams, NavController, ToastController, AlertController } from 'ionic-angular';
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
  private isDefault: boolean;

  constructor(
    private platform: Platform,
    private navParams: NavParams,
    private salesTaxService: SalesTaxService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
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
      this.isDefault = this.tax.isDefault;
    }).catch(console.error.bind(console));
  }

  public upsert() {
    if (this.tax && this.tax.rate) {
      this.tax.rate = Number(this.tax.rate);
      this.salesTaxService[this.isNew ? 'add' : 'update'](this.tax).then(() => {
        this.navCtrl.pop();
      }).catch((error) => {
        throw new Error(error);
      });
    } else {
      let toast = this.toastCtrl.create({
        message: `Some fields are empty!`,
        duration: 3000
      });
      toast.present();
    }
  }

  public remove() {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete it ?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            let tax = this.tax;

            this.salesTaxService.removeSalesTaxFromGroups(tax).then(() => {
              this.salesTaxService.delete(tax).then(() => {
                let toast = this.toastCtrl.create({
                  message: `${tax.name} has been deleted successfully`,
                  duration: 3000
                });
                toast.present();
                this.navCtrl.pop();
              }).catch(error => {
                throw new Error(error);
              });
            }).catch((error) => {
              throw new Error(error);
            });

          }
        }, 'No'
      ]
    });
    confirm.present();
  }

}