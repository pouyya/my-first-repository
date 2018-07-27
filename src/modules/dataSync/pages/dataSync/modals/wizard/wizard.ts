import {ViewController, NavController, AlertController, Events} from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
    selector: "wizard",
    templateUrl: "wizard.html"
})
export class Wizard {

    public taxFileNumber: string = "";
    public phoneNumber: string = "";
    public address: string = "";
    public socialNumber: string = "";
    public adminPin: number;

    step: any;
    stepCondition: any;
    currentStep: any;

    constructor(public navCtrl: NavController, public viewCtrl: ViewController, public alertCtrl: AlertController, public evts: Events) {
        this.step = 1;
        this.currentStep = this.step;
        this.stepCondition = false;
        this.evts.subscribe('step:changed', step => {
            this.currentStep = step;
            this.onFieldChanged();
        });
    }
    onFinish() {
        this.alertCtrl.create({
            message: 'Wizard Finished!!',
            title: 'Congrats!!',
            buttons: [{
                text: 'Ok'
            }]
        }).present();
    }

    onFieldChanged() {
        if(this.currentStep === 1 && (this.taxFileNumber == "" || this.phoneNumber == "" || this.address == "")){
            this.stepCondition = false;
        }else{
            this.stepCondition = true
        }
    }

    dismiss() {
        this.viewCtrl.dismiss()
    }
}