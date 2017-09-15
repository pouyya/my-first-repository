import _ from 'lodash';
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform, ToastController, LoadingController } from 'ionic-angular';
import { UserService } from './../../services/userService';
import { NgZone } from '@angular/core';
import { AppSettings } from './../../model/appSettings';
import { AppSettingsService } from './../../services/appSettingsService';
import { SettingsModule } from './../../modules/settingsModule';
import { PageModule } from './../../metadata/pageModule';
import { HelperService } from "../../services/helperService";
import { AppService } from "../../services/appService";
import { SalesTaxService } from './../../services/salesTaxService';

@PageModule(() => SettingsModule)
@Component({
  selector: 'app-settings',
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
    private appSettingsService: AppSettingsService,
    private salesTaxService: SalesTaxService,
    private userService: UserService,
    private helperService: HelperService,
    private appService: AppService,
    private zone: NgZone,
    private toast: ToastController,
    private loading: LoadingController,
    private cdr: ChangeDetectorRef
  ) {
    this.cdr.detach();
    this.taxTypes = [
      { _id: 0, type: 'Tax Exclusive' },
      { _id: 1, type: 'Tax Inclusive' }
    ]
  }

  ionViewDidLoad() {
    var promises: Array<Promise<any>> = [
      this.appService.loadSalesAndGroupTaxes(),
      this.appSettingsService.get()
    ];

    Promise.all(promises).then((results) => {
      this.zone.run(() => {
        this.salesTaxes = results[0];
        this.setting = results[1];
        this.selectedType = !this.setting.taxType ? 0 : 1;
        this.selectedTax = this.setting.defaultTax;
        this.currentTax = _.find(this.salesTaxes, (saleTax) => {
          return saleTax._id === this.setting.defaultTax;
        });
        this.cdr.reattach();
      });
    });
  }

  public save() {
    let loader = this.loading.create({
      content: 'Saving Settings...',
    });

    loader.present().then(() => {
      this.setting.taxType = this.selectedType == 0 ? false : true;
      this.newTax = _.find(this.salesTaxes, (saleTax) => {
        return saleTax._id === this.selectedTax;
      });
      this.setting.defaultTax = this.newTax._id;
      this.setting.taxEntity = this.newTax.entityTypeName;
      this.appSettingsService.update(this.setting).then(() => {
        this.currentTax = this.newTax
        // a weird hack
        this.appService.loadSalesAndGroupTaxes().then((taxes: Array<any>) => {
          this.salesTaxes = taxes;
          let user = this.userService.getLoggedInUser();
          user.settings.defaultTax = this.newTax._id;
          user.settings.taxEntity = this.newTax.entityTypeName;
          user.settings.taxType = this.selectedType;
          user.settings.trackEmployeeSales = this.setting.trackEmployeeSales;
          this.userService.setSession(user);
          loader.dismiss();
          let toast = this.toast.create({
            message: "Settings have been saved",
            duration: 2000
          });
          toast.present();
        });
      }).catch(error => {
        throw new Error(error);
      });
    });
  }
}
