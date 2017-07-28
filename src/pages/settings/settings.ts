import _ from 'lodash';
import { UserService } from './../../services/userService';
import { NgZone } from '@angular/core';
import { AppSettings } from './../../model/appSettings';
import { AppSettingsService } from './../../services/appSettingsService';
import { SalesTaxService } from './../../services/salesTaxService';
import { SettingsModule } from './../../modules/settingsModule';
import { Component } from '@angular/core';
import { NavController, Platform, ToastController } from 'ionic-angular';
import { PageModule } from './../../metadata/pageModule';

@PageModule(() => SettingsModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'settings.html'
})
export class Settings {

  public salesTaxes: Array<any> = [];
  public defaultTax: string;
  public setting: AppSettings;
  public taxTypes: Array<any> = [];
  public selectedType: number;
  public selectedTax: string;
  private currentTax: any;
  private newTax: any;

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
      { _id: 0, type: 'Tax Exclusive' },
      { _id: 1, type: 'Tax Inclusive' }
    ]
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      var promises: Array<Promise<any>> = [
        new Promise((resolve, reject) => {
          this.appSettingsService.loadSalesAndGroupTaxes().then((taxes: Array<any>) => {
            this.salesTaxes = taxes;
            resolve()
          }).catch(error => reject(error));
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
          this.selectedType = !this.setting.taxType ? 0 : 1;
          this.selectedTax = this.setting.defaultTax;
          this.currentTax = _.find(this.salesTaxes, (saleTax) => {
            return saleTax._id === this.setting.defaultTax;
          });
        });
      })
    })
  }

  public save() {
    this.setting.taxType = this.selectedType == 0 ? false : true;
    this.newTax = _.find(this.salesTaxes, (saleTax) => {
      return saleTax._id === this.selectedTax;
    });
    this.setting.defaultTax = this.newTax._id;
    this.setting.taxEntity = this.newTax.entityTypeName;    
    this.appSettingsService.update(this.setting).then(() => {
      this.salesTaxService.makeDefault(this.newTax, this.currentTax).then(() => {
        this.currentTax = this.newTax
        // a weird hack
        this.appSettingsService.loadSalesAndGroupTaxes().then((taxes: Array<any>) => {
          this.salesTaxes = taxes;
          let user = this.userService.getLoggedInUser();
          user.settings.defaultTax = this.newTax._id;
          user.settings.taxEntity = this.newTax.entityTypeName;
          user.settings.taxType = this.selectedType;
          this.userService.persistUser(user);
          let toast = this.toast.create({
            message: "Settings have been saved",
            duration: 2000
          });
          toast.present();
        });

      }).catch(error => {
        throw new Error(error);
      });
    }).catch(error => {
      throw new Error(error);
    });
  }

}
