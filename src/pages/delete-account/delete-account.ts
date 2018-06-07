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
 import { Storage } from '@ionic/storage';
 
 @PageModule(() => SettingsModule)
 @SecurityModule(SecurityAccessRightRepo.DeleteAccount)
 @Component({
   selector: 'delete-account',
   templateUrl: 'delete-account.html'
 })
 export class DeleteAccount {
 
    response;

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
        let loader = this.loading.create({ content: 'Deleting Account...', });
        await loader.present();

        var delAccountResponse = await this.deleteAccountService.deleteAccount();
        delAccountResponse.subscribe(response => this.response = response);


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