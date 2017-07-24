import { UserService } from './../../services/userService';
import { NgZone } from '@angular/core';
import { AppSettings } from './../../model/appSettings';
import { AppSettingsService } from './../../services/appSettingsService';
import { SalesTax } from './../../model/salesTax';
import { SalesTaxService } from './../../services/salesTaxService';
import { SettingsModule } from './../../modules/settingsModule';
import { SaleTaxPage } from './../admin/sale-tax/sale-tax';
import { Category } from './../category/category';
import { Employees } from './../employees/employees';
import { Component } from '@angular/core';
import { NavController, Platform, ToastController } from 'ionic-angular';
import { Products } from '../products/products';
import { Stores } from '../stores/stores';
import { Services } from '../service/service';
import { PageModule } from './../../metadata/pageModule';

@PageModule(() => SettingsModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'settings.html'
})
export class Settings {

  public salesTaxes: Array<SalesTax> = [];
  public defaultTax: string;
  public setting: AppSettings;
  public taxTypes: Array<any> = [];
  public selectedType: string;
  public selectedTax: string;

  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private salesTaxService: SalesTaxService,
    private appSettingsService: AppSettingsService,
    private userService: UserService,
    private zone: NgZone,
    private toast: ToastController
  ) {
    this.taxTypes = [
      { _id: "0", type: 'Tax Exclusive' },
      { _id: "1", type: 'Tax Inclusive' }
    ]
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      var promises: Array<Promise<any>> = [
        new Promise((resolve, reject) => {
          this.salesTaxService.getAll().then((taxes: Array<SalesTax>) => {
            this.salesTaxes = taxes;
            resolve();
          })
        }),
        new Promise((resolve, reject) => {
          this.appSettingsService.get().then((setting: AppSettings) => {
            this.setting = setting;
            resolve();
          })
        })
      ];

      Promise.all(promises).then(() => {
        this.zone.run(() => {
          this.selectedType = this.setting.taxType;
          this.selectedTax = this.setting.defaultTax;
        });
      })
    })
  }

  public onTaxChange() {
    this.setting.defaultTax = this.selectedTax;
    this.appSettingsService.update(this.setting).then(() => {
      let user = this.userService.getLoggedInUser();
      user.settings.defaultTax = this.selectedTax;
      this.userService.persistUser(user);
      let toast = this.toast.create({
        message: "Settings have been saved",
        duration: 2000
      });
      toast.present();
    }).catch(error => {
      throw new Error(error);
    });
  }

  public onTaxTypeChange() {
    this.setting.taxType = this.selectedType;
    this.appSettingsService.update(this.setting).then(() => {
      let user = this.userService.getLoggedInUser();
      user.settings.taxType = this.selectedType;
      this.userService.persistUser(user);
      let toast = this.toast.create({
        message: "Settings have been saved",
        duration: 2000
      });
      toast.present();
    }).catch(error => {
      throw new Error(error);
    });
  }

}
