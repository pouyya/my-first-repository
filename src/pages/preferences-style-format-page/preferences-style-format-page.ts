import _ from 'lodash';
import { Component } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SyncContext } from "../../services/SyncContext";
import { StoreService } from "../../services/storeService";
import { SecurityAccessRightRepo } from "../../model/securityAccessRightRepo";
import { PreferencesModule } from '../../modules/preferencesModule';


@SecurityModule(SecurityAccessRightRepo.PreferencesStyleFormatPage)
@PageModule(() => PreferencesModule)
@Component({
  selector: 'preferences-style-format-page',
  templateUrl: 'preferences-style-format-page.html'
})
export class PreferencesStyleFormatPage {
  public dateFormats: Array<any> = [{ "_id": 1, "format": "mm/dd/yyyy", "example": "11/22/1992" }];

  constructor(
    private loading: LoadingController,
    private storeService: StoreService,
    private syncContext: SyncContext
  ) {
  }

  async ionViewDidLoad() {
  }


  public async save() {
    let loader = this.loading.create({
      content: 'Saving Preferences...'
    });
    await loader.present();
    await this.storeService.updatePOS(this.syncContext.currentPos, this.syncContext.currentStore);
    await loader.dismiss();
  }
}