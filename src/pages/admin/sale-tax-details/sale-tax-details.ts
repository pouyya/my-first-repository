import {SalesTaxService} from './../../../services/salesTaxService';
import {Platform, NavParams, NavController, ToastController, AlertController, LoadingController} from 'ionic-angular';
import {SalesTax} from './../../../model/salesTax';
import {Component} from '@angular/core';

@Component({
  selector: "sale-tax-details",
  templateUrl: "sale-tax-details.html"
})
export class SaleTaxDetails {

  public tax: SalesTax;
  public isNew: boolean;
  public action: string;

  constructor(private platform: Platform,
              private navParams: NavParams,
              private salesTaxService: SalesTaxService,
              private navCtrl: NavController,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private loading: LoadingController) {
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
      title: 'Are you sure you want to delete this tax ?',
      message: 'Deleting this tax will reset all products that are using it, to default tax. If this is default tax, then default tax will be set to \'No Tax 0%\' and products will be set to \'No Tax 0% as well\'',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            let loader = this.loading.create({
              content: 'Deleting. Please Wait!',
            });

            loader.present().then(() => {
              let tax = this.tax;
              this.salesTaxService.processDeletion(tax).then(() => {
                // if all processing done, then finally delete this tax
                this.salesTaxService.delete(tax).then(() => {
                  let toast = this.toastCtrl.create({
                    message: `${tax.name} has been deleted successfully`,
                    duration: 3000
                  });
                  loader.dismiss();
                  toast.present();
                  this.navCtrl.pop();
                }).catch(error => {
                  throw new Error(error);
                });
              }).catch(error => {
                throw new Error(error);
              });
            });
          }
        }, 'No'
      ]
    });
    confirm.present();
  }

}