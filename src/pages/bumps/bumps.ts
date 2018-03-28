import { SearchableListing } from './../../modules/searchableListing';
import { BumpDetails } from './../bump-details/bump-details';
import { DeviceService } from './../../services/deviceService';
import { Component, NgZone } from '@angular/core';
import { Device } from "../../model/device";
import { NavController, LoadingController } from 'ionic-angular';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { FilterType, Item } from "../../metadata/listingModule";

// @SecurityModule(SecurityAccessRightRepo.EmployeeListing)
@Component({
  selector: 'bump',
  templateUrl: 'bumps.html',
})
export class Bumps {

  protected items: Device[] = [];
  public statusList: any = [
    { value: '', text: 'All' },
    { value: 'true', text: 'Active' },
    { value: 'false', text: 'In-Active' }
  ];

  constructor(public navCtrl: NavController,
    protected deviceService: DeviceService,
    protected zone: NgZone,
    private loading: LoadingController
  ) {
  }

  async ionViewDidEnter() {
    let loader = this.loading.create({ content: 'Loading Employees...' });
    await loader.present();
    this.items = await this.deviceService.getCurrentStoreDevices();
    loader.dismiss();
  }

  public showDetail(device: Device) {
    this.navCtrl.push(BumpDetails, { device });
  }


}