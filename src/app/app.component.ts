import * as moment from 'moment';
import { Observable } from 'rxjs/Observable';
import { Component, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { Nav, Platform, ModalController, LoadingController, AlertController } from 'ionic-angular';
import { Insomnia } from '@ionic-native/insomnia';
import { EmployeeService } from './../services/employeeService';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SwitchPosModal } from './modals/switch-pos/switch-pos';
import { UserService } from './../services/userService';
import { ModuleService } from './../services/moduleService';
import { PluginService } from './../services/pluginService';
import { SharedService } from './../services/_sharedService';
import { UserSession } from './../model/UserSession';
import { ModuleBase } from "../modules/moduelBase";
import { DeployPage } from "../pages/deploy/deploy";
import { LoginPage } from './../pages/login/login';
import { POS } from './../model/pos';
import { Store } from './../model/store';

@Component({
  selector: 'app',
  templateUrl: 'app.html'
})
export class SimplePOSApp implements OnInit {
  @ViewChild(Nav) nav: Nav;
  public rootPage: any;
  public currentModule: ModuleBase;
  public moduleName: string;
  public user: UserSession;
  public currentStore: Store = null;
  public currentPos: POS = null;
  private checkTime: Observable<any> = Observable.interval(1000);

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private userService: UserService,
    private moduleService: ModuleService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private loading: LoadingController,
    private insomnia: Insomnia,
    private pluginService: PluginService,
    private _sharedService: SharedService,
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {
    this.checkTime.subscribe(() => {
      let date = moment().format("h:mm:ss a");
      if (date === "12:00:00 am") {
        // uncomment this line to enable log out
        // this.logOutAllStaffs();
      }
    });
    this._sharedService.payload$.subscribe((data) => {
      if (data.hasOwnProperty('currentStore') && data.hasOwnProperty('currentPos')) {
        this.currentStore = data.currentStore;
        this.currentPos = data.currentPos;
      }

      if (data.hasOwnProperty('screenAwake') && !this.platform.is('core')) {
        data.screenAwake ? this.insomnia.keepAwake() : this.insomnia.allowSleepAgain();
      }
    });
    this.currentModule = this.moduleService.getCurrentModule();
    this.moduleName = this.currentModule.constructor.name;
    this.initializeApp();
  }

  // This code will persist user session in device
  async ngOnInit() {
    try {
      // TODO: Insomnia should be moved to App Settings where it can be awake or asleep
      this.user = await this.userService.getUser();
      this.rootPage = this.user ? DeployPage : LoginPage;
      if (!this.platform.is('core')) {
        this.user.settings.screenAwake ? this.insomnia.keepAwake() : this.insomnia.allowSleepAgain();
      }      
      return;
    } catch (error) {
      console.error(error);
      this._errorHandler("An error has occurred.")
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  private _errorHandler(error) {
    this.pluginService.openDialoge(error).catch(e => {
      throw new Error(e);
    })
  }

  switchRegister() {
    let modal = this.modalCtrl.create(SwitchPosModal);
    modal.onDidDismiss(data => {
      if (data) {
        let loader = this.loading.create();

        loader.present().then(() => {
          data.hasOwnProperty('currentStore') && (this.currentStore = data.currentStore);
          data.hasOwnProperty('currentPos') && (this.currentPos = data.currentPos);
          this.user = this.userService.getLoggedInUser();
          this.nav.setRoot(this.nav.getActive().component);
          loader.dismiss();
        });
      }
    });
    modal.present();
  }

  openPage(page) {
    this.currentModule = this.moduleService.getCurrentModule(page);
    this.moduleName = this.currentModule.constructor.name;
    if (page.hasOwnProperty('modal') && page.modal) {
      let modal = this.modalCtrl.create(page.component);
      modal.onDidDismiss(data => {
        if (page.hasOwnProperty('onDismiss') && typeof page.onDismiss == 'function') {
          page.onDismiss(data);
        }
      });
      modal.present();
    } else {
      this.nav[page.hasOwnProperty('pushNavigation') && page.pushNavigation ? 'push' : 'setRoot'](page.component);
    }
  }

  private async logOutAllStaffs() {
    let loader = this.loading.create({
      content: "Logging out all staffs, Please Wait"
    });
    await loader.present();
    await this.employeeService.logOutAllStaffs();
    loader.dismiss();
  }

}