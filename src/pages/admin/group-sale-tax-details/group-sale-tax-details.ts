import { GroupSalesTaxService } from './../../../services/groupSalesTaxService';
import _ from 'lodash';
import { SalesTax } from './../../../model/salesTax';
import { SalesTaxService } from './../../../services/salesTaxService';
import { Platform, NavController, AlertController, ToastController, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { GroupSaleTax } from './../../../model/groupSalesTax';

@Component({
  selector: 'group-sale-tax-details',
  templateUrl: 'group-sale-tax-details.html'
})
export class GroupSaleTaxDetailsPage {

  public groupSalesTax: GroupSaleTax = new GroupSaleTax();
  public salesTaxes: Array<any> = [];
  public selectedSalesTaxes: Array<SalesTax> = [];
  public isNew = true;
  public action = 'Add';

  constructor(private navParams: NavParams,
              private platform: Platform,
              private salesTaxService: SalesTaxService,
              private groupSalesTaxService: GroupSalesTaxService,
              private navCtrl: NavController,
              private alertCtrl: AlertController,
              private toastCtrl: ToastController,
              private loading: LoadingController) {
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
          this.salesTaxService.findBy({
            selector: { _id: { $ne: "no_sales_tax" } }
          }).then((taxes: Array<any>) => {
            this.salesTaxes = _.filter(taxes, (tax) => {
              return tax.entityTypeName === 'SalesTax';
            }).map((tax) => {
              tax.checked = false;
              return tax;
            });
            resolve();
          }).catch(error => {
            reject(error);
          })
        })
      ];

      Promise.all(promises).then(() => {
        if (!this.isNew && this.groupSalesTax.salesTaxes.length > 0) {
          this.salesTaxes = this.salesTaxes.map((tax) => {
            let item = _.find(this.groupSalesTax.salesTaxes, { _id: tax._id });
            if (item) {
              tax.checked = true;
              this.selectedSalesTaxes.push(tax);
            }
            return tax;
          })
        }
      }).catch(error => {
        throw new Error(error);
      });

    }).catch(error => {
      throw new Error(error);
    })
  }

  public onSelect(event: any, item: any) {
    if (event.checked) {
      this.selectedSalesTaxes.push(item);
    } else {
      let index = _.findIndex(this.selectedSalesTaxes, { _id: item._id });
      this.selectedSalesTaxes.splice(index, 1);
    }
  }

  public upsert() {
    this.groupSalesTax.salesTaxes = this.selectedSalesTaxes.map((selected) => {
      return { _id: selected._id };
    });
    if (this.groupSalesTax.name && this.groupSalesTax.salesTaxes.length > 0) {
      this.groupSalesTax.rate = _.reduce(this.selectedSalesTaxes.map((selected) => Number(selected.rate)), (sum, n) => sum + n, 0);
      this.groupSalesTaxService[this.isNew ? 'add' : 'update'](this.groupSalesTax).then(() => {
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
      title: 'Are you sure you want to delete this tax group ?',
      message: 'Deleting it will reset all products that are using it, to default tax. If this is default tax, then default tax will be set to \'No Tax 0%\' and products will be set to \'No Tax 0% as well\'',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            let loader = this.loading.create({
              content: 'Deleting. Please Wait!',
            });

            loader.present().then(() => {
              let group = this.groupSalesTax;
              this.groupSalesTaxService.processDeletion(group).then(() => {
                // if all processing done, then finally delete this tax
                this.groupSalesTaxService.delete(group).then(() => {
                  let toast = this.toastCtrl.create({
                    message: `${group.name} has been deleted successfully`,
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