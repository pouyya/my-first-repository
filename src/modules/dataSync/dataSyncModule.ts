import { SharedService } from './../../services/_sharedService';
import { StoreService } from './../../services/storeService';
import { DateTimeService } from './../../services/dateTimeService';
import { IonicPageModule } from 'ionic-angular';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { LoginPage } from './pages/login/login';
import { DataSync } from './pages/dataSync/dataSync';
import { AccountSettingService } from './services/accountSettingService';
import { AuthService } from './services/authService';
import { UserService } from './services/userService';
import { LogOut } from './pages/logout/logout';
import { ForgotPassword } from './pages/login/modals/forgot-password/forgot-password';
import { CommonModule } from '@angular/common';
import { DataBootstrapper } from '../../pages/data-bootstrapper/data-bootstrapper';
import { IonSimpleWizardModule } from "../../components/ion-simple-wizard/simple-wizard.module";
import { Wizard } from "./pages/dataSync/modals/wizard/wizard";
import { SharedModule } from "../shared.module";
import { SearchableIonSelectModule } from '../../components/searchable-ion-select/searchable-ion-select.module';

@NgModule({
	imports: [CommonModule, SharedModule, IonSimpleWizardModule, 
		IonicPageModule.forChild(DataSync), SearchableIonSelectModule],

	declarations: [
		LoginPage,
		DataSync,
		DataBootstrapper,
		LogOut,
		ForgotPassword,
		Wizard
	],

	entryComponents: [
		LoginPage,
		DataSync,
		DataBootstrapper,
		LogOut,
		ForgotPassword,
		Wizard
	],
	providers: []
})
export class DataSyncModule {

	static forRoot(): ModuleWithProviders {
		return <ModuleWithProviders>{
			ngModule: DataSyncModule,
			providers: [
				AccountSettingService,
				AuthService,
				UserService,
				DateTimeService,
				StoreService,
				SharedService
			]
		}
	}

}