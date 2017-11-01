import { Observable } from 'rxjs/Observable';
import { Component, ViewChild, ChangeDetectorRef, OnInit } from '@angular/core';
import { Nav, Platform, ModalController, LoadingController, AlertController } from 'ionic-angular';
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
    private pluginService: PluginService,
    private _sharedService: SharedService,
    private cdr: ChangeDetectorRef
  ) {   
    // this.checkTime.subscribe(() => {
    //   let date = new Date().toISOString();
    //   if(date == "2017-11-01T12:24:27.286Z") {
    //
    //     this.logOutAllStaffs();
    //   }
    // })

    this._sharedService.payload$.subscribe((data) => {
      if(data.hasOwnProperty('currentStore') && data.hasOwnProperty('currentPos')) {
        this.currentStore = data.currentStore;
        this.currentPos = data.currentPos;
      }
    });
    this.currentModule = this.moduleService.getCurrentModule();
    this.moduleName = this.currentModule.constructor.name;
    this.initializeApp();
  }

  // This code will persist user session in device
  async ngOnInit() {
    try {
      this.user = await this.userService.getUser();
      this.rootPage = this.user ? DeployPage : LoginPage;
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

  // imitating a service worker
  private logOutAllStaffs() {
    alert("All Employees have been logged out");
  }

}