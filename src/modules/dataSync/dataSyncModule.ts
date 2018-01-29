import { NgModule, ModuleWithProviders } from '@angular/core';
import { LoginPage } from './pages/login/login';
import { DataSync } from './pages/dataSync/dataSync';
import { AccountSettingService } from './services/accountSettingService';
import { AuthService } from './services/authService';
import { UserService } from './services/userService';
import { LogOut } from './pages/logout/logout';
import { ForgotPassword } from './pages/login/modals/forgot-password/forgot-password';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [CommonModule],
    declarations: [LoginPage, DataSync, LogOut, ForgotPassword],
    entryComponents: [LoginPage, DataSync, LogOut, ForgotPassword]
})
export class DataSyncModule {

    static _appMainPage: any;

    static forRoot(appMainPage: any): ModuleWithProviders {

        DataSyncModule._appMainPage = appMainPage;

        return {
            ngModule: DataSyncModule,
            providers: [
                AccountSettingService,
                AuthService,
                UserService
            ]
        }
    }

}