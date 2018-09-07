import _ from 'lodash';
import { Component } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SyncContext } from "../../services/SyncContext";
import { StoreService } from "../../services/storeService";
import { SecurityAccessRightRepo } from "../../model/securityAccessRightRepo";
import { PreferencesModule } from '../../modules/preferencesModule';
import { ResourceService } from '../../services/resourceService';


@SecurityModule(SecurityAccessRightRepo.PreferencesStyleFormatPage)
@PageModule(() => PreferencesModule)
@Component({
  selector: 'preferences-style-format-page',
  templateUrl: 'preferences-style-format-page.html'
})
export class PreferencesStyleFormatPage {
  public dateFormats: { _id: number, format: string, example: string }[] = [{ _id: 0, format: 'Default', example: null }];
  public selectedDateFormat;

  constructor(
    private loading: LoadingController,
    private storeService: StoreService,
    private resourceService: ResourceService,
    private syncContext: SyncContext
  ) {
  }

  async ionViewDidLoad() {
    let dateFormats = await this.resourceService.getDateFormats();
    dateFormats && (this.dateFormats = this.dateFormats.concat(dateFormats));
    this.selectedDateFormat = 1;
  }

  public async save() {
    this.syncContext.currentPos.dateFormat = this.selectedDateFormat;
    let loader = this.loading.create({
      content: 'Saving Preferences...'
    });
    await loader.present();
    await this.storeService.updatePOS(this.syncContext.currentPos, this.syncContext.currentStore);
    await loader.dismiss();
  }
}