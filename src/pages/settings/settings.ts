import _ from 'lodash';
import * as moment from 'moment-timezone';
import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, Platform, ToastController, LoadingController } from 'ionic-angular';
import { NgZone } from '@angular/core';
import { SettingsModule } from './../../modules/settingsModule';
import { PageModule } from './../../metadata/pageModule';
import { SharedService } from './../../services/_sharedService';
import { HelperService } from "../../services/helperService";
import { AppService } from "../../services/appService";
import { SalesTaxService } from './../../services/salesTaxService';
import { DateTimeService } from './../../services/dateTimeService';
import { AccountSetting } from '../../modules/dataSync/model/accountSetting';
import { AppSettingsInterface } from '../../modules/dataSync/model/UserSession';
import { UserService } from '../../modules/dataSync/services/userService';
import { AccountSettingService } from '../../modules/dataSync/services/accountSettingService';

@PageModule(() => SettingsModule)
@Component({
  selector: 'app-settings',
  templateUrl: 'settings.html'
})
export class Settings {

  public defaultTax: string;
  public salesTaxes: Array<any> = [];
  public taxTypes: Array<any> = [];
  public timezones: Array<string> = [];
  public selectedType: number;
  public selectedTax: string;
  public accountSetting: AccountSetting;
  private currentTax: any;
  private newTax: any;
  private setting: AppSettingsInterface;

  constructor(
    private navCtrl: NavController,
    private platform: Platform,
    private salesTaxService: SalesTaxService,
    private userService: UserService,
    private helperService: HelperService,
    private appService: AppService,
    private _sharedService: SharedService,
    private zone: NgZone,
    private toast: ToastController,
    private loading: LoadingController,
    private cdr: ChangeDetectorRef,
    private accountSettingService: AccountSettingService,
    private datetimeService: DateTimeService
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
      this.userService.getUser(),
      this.accountSettingService.getCurrentSetting()
    ];

    Promise.all(promises).then(results => {
      this.zone.run(() => {
        this.salesTaxes = results[0];
        this.setting = results[1];
        this.accountSetting = results[2];
        this.timezones = <string[]>moment.tz.names();
        this.selectedType = !this.accountSetting.taxType ? 0 : 1;
        this.selectedTax = this.accountSetting.defaultTax;
        this.currentTax = _.find(this.salesTaxes, (saleTax) => {
          return saleTax._id === this.accountSetting.defaultTax;
        });
        this.cdr.reattach();
      });
    });
  }

  public async save() {
    let loader = this.loading.create({
      content: 'Saving Settings...',
    });

    await loader.present();

    this.newTax = _.find(this.salesTaxes, (saleTax) => {
      return saleTax._id === this.selectedTax;
    });
    this.currentTax = this.newTax
    var taxes: Array<any> = await this.appService.loadSalesAndGroupTaxes();
    this.salesTaxes = taxes;

    this._sharedService.publish('storeOrPosChanged', { screenAwake: this.accountSetting.screenAwake });

    this.accountSetting.taxType = this.selectedType == 0 ? false : true;
    this.accountSetting.defaultTax = this.newTax._id;
    this.accountSetting.taxEntity = this.newTax.entityTypeName;
    if (this.accountSetting.timeOffset) {
      this.datetimeService.timezone = this.accountSetting.timeOffset;
    }

    this.accountSettingService.update(this.accountSetting);

    await loader.dismiss();
    let toast = this.toast.create({
      message: "Settings have been saved",
      duration: 2000
    });
    toast.present();
  }
}
