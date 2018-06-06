import { DBService } from '@simpleidea/simplepos-core/dist/services/dBService';
import { Component } from '@angular/core';
import { PageModule } from '../../metadata/pageModule';
import { DeleteAccountService } from "../../services/deleteAccountService";
import { LoadingController, NavController, AlertController, MenuController } from "ionic-angular";
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { SettingsModule } from '../../modules/settingsModule';
import { LogOut } from '../../modules/dataSync/pages/logout/logout';
import { LoginPage } from "../../modules/dataSync/pages/login/login";

@PageModule(() => SettingsModule)
@SecurityModule(SecurityAccessRightRepo.RoleListing)
@Component({
  selector: 'delete-account',
  templateUrl: 'delete-account.html'
})
export class DeleteAccount {


  constructor(
    private navCtrl: NavController,
    private deleteAccountService: DeleteAccountService,
    private loading: LoadingController,
    private storage: Storage,
    private alertCtrl: AlertController,
    private menuController: MenuController
  ) {

  }

  
  public async deleteAccount() {
    let loader = this.loading.create({ content: 'Loading Report...', });
    await loader.present();

    var delAccount = await this.deleteAccountService.deleteAccount();
    delAccount.subscribe();

    loader = this.loading.create({
      content: 'Logging Out...'
    });
    try {
      await loader.present();
      await this.menuController.close();
      await this.storage.clear();
      await DBService.destroyInternals();
      localStorage.clear();
      loader.dismiss();
      this.navCtrl.setRoot(LoginPage);
    } catch (err) {
      throw new Error(err);
    }
  }

  }
}