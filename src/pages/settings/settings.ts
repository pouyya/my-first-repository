import _ from 'lodash';
import * as moment from 'moment-timezone';
import { Component, ChangeDetectorRef } from '@angular/core';
import { ToastController, LoadingController } from 'ionic-angular';
import { NgZone } from '@angular/core';
import { SettingsModule } from './../../modules/settingsModule';
import { PageModule } from './../../metadata/pageModule';
import { AppService } from "../../services/appService";
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from './../../model/securityAccessRightRepo';
import { AccountSetting } from '../../modules/dataSync/model/accountSetting';
import { AppSettingsInterface } from '../../modules/dataSync/model/UserSession';
import { UserService } from '../../modules/dataSync/services/userService';
import { AccountSettingService } from '../../modules/dataSync/services/accountSettingService';
import { SyncContext } from "../../services/SyncContext";
import { ResourceService } from '../../services/resourceService';
import { DateTimeService } from '../../services/dateTimeService';

@PageModule(() => SettingsModule)
@SecurityModule(SecurityAccessRightRepo.Settings)
@Component({
  selector: 'app-settings',
  templateUrl: 'settings.html'
})
export class Settings {

  public defaultTax: string;
  public salesTaxes: Array<any> = [];
  public taxTypes: Array<any> = [];
  public timezones: Array<{ code: string, name: string }> = [];
  public selectedType: number;
  public selectedTax: string;
  public accountSetting: AccountSetting;
  private currentTax: any;
  private newTax: any;
  private setting: AppSettingsInterface;
  public dateFormats: { _id: number, format: string, example: string }[] = [{ _id: 0, format: 'Default', example: null }];

  constructor(
    private userService: UserService,
    private appService: AppService,
    private zone: NgZone,
    private toast: ToastController,
    private loading: LoadingController,
    private cdr: ChangeDetectorRef,
    private accountSettingService: AccountSettingService,
    private syncContext: SyncContext,
    private resourceService: ResourceService,
    private dateTimeService: DateTimeService
  ) {
    this.cdr.detach();
    this.taxTypes = [
      { _id: 0, type: 'Tax Exclusive' },
      { _id: 1, type: 'Tax Inclusive' }
    ];
  }

  async ionViewDidLoad() {
    let dateFormats = await this.resourceService.getDateFormats();
    dateFormats && (this.dateFormats = this.dateFormats.concat(dateFormats));

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
        this.timezones = this.dateTimeService.getAllTimeZones();
        this.selectedType = !this.accountSetting.taxType ? 0 : 1;
        this.selectedTax = this.accountSetting.defaultTax;
        this.accountSetting.timeOffset &&
          (this.accountSetting.timeOffset = { code: this.accountSetting.timeOffset, value: this.accountSetting.timeOffset });
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

    this.accountSetting.taxType = this.selectedType == 0 ? false : true;
    this.accountSetting.defaultTax = this.newTax._id;
    this.accountSetting.taxEntity = this.newTax.entityTypeName;

    if (this.accountSetting.timeOffset) {
      this.accountSetting.timeOffset = this.accountSetting.timeOffset.code;
      this.syncContext.appTimezone = this.accountSetting.timeOffset;
    }

    await this.accountSettingService.update(this.accountSetting);
    this.accountSetting.timeOffset &&
      (this.accountSetting.timeOffset = { code: this.accountSetting.timeOffset, value: this.accountSetting.timeOffset });
    await loader.dismiss();
    let toast = this.toast.create({
      message: "Settings have been saved",
      duration: 2000
    });
    toast.present();
  }
}