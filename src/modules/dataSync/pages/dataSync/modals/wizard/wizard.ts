import {ViewController, NavController, AlertController, Events, NavParams, LoadingController} from 'ionic-angular';
import { Component } from '@angular/core';
import * as moment from "moment-timezone";
import {StoreService} from "../../../../../../services/storeService";
import {Store} from "../../../../../../model/store";

@Component({
    selector: "wizard",
    templateUrl: "wizard.html",
    styles: [`
        .wizard-info{
            padding: 25px;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
        }
    `, `        
        .list-padding{
            padding-bottom: 70px;
        }
    `]
})
export class Wizard {

    public taxFileNumber: string = "";
    public phoneNumber: string = "";
    public address: string = "";
    public twitter: string = "";
    public facebook: string = "";
    public instagram: string = "";
    public adminPin: string = "";
    public store: Store = new Store();
    step: any;
    stepCondition: any;
    currentStep: any;

    constructor(public navCtrl: NavController, public viewCtrl: ViewController,
                public alertCtrl: AlertController, public events: Events, private storeService: StoreService,
                private navParams: NavParams, private loading: LoadingController) {
        this.step = 1;
        this.currentStep = this.step;
        this.stepCondition = true;
        this.events.subscribe('step:changed', step => {
            this.currentStep = step;
            this.onFieldChanged();
        });
    }

    async ionViewDidEnter() {
        let loader = this.loading.create({
            content: 'Loading...'
        });

        let currentStore = this.navParams.get('currentStore');
        if (currentStore) {
            this.store = await this.storeService.get(currentStore);
        }else{
            let allStores = await this.storeService.getAll();
            this.store = allStores[0];
        }

        await loader.dismiss();
    }

    public async onFinish() {
        await this.storeService.update(this.store);
        this.viewCtrl.dismiss({
            status: true, adminPin: this.adminPin
        });
    }

    public onFieldChanged() {
        if (this.currentStep === 2 && (this.store.taxFileNumber == "" || this.store.phone == "" || this.store.address == "" || this.adminPin == "")) {
            this.stepCondition = false;
        } else {
            this.stepCondition = true
        }
    }

    public dismiss() {
        const alert = this.alertCtrl.create({
            title: 'Dear user please provide information to be able to proceed to next step.',
            buttons: ['OK']
        });
        alert.present();
    }
}