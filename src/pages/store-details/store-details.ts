import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { AlertController, LoadingController, NavController, NavParams, ToastController } from 'ionic-angular';
import { StoreService } from "../../services/storeService";
import { Store } from './../../model/store';
import { PosDetailsPage } from './../pos-details/pos-details';
import { POS } from './../../model/pos';
import { PosService } from './../../services/posService';

@Component({
  templateUrl: 'store-details.html',
})
export class StoreDetailsPage {
  public item: Store = new Store();
  public isNew: boolean = true;
  public action: string = 'Add';
  public registers: Array<POS> = [];
  public countries: Array<any> = [];

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private storeService: StoreService,
              private posService: PosService,
              private loading: LoadingController,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,
              private http: Http) {
  }

  ionViewDidEnter() {
    let loader = this.loading.create({
      content: 'Loading Store...'
    });

    loader.present().then(() => {
      let promises: Array<Promise<any>> = [
        // load store data
        new Promise((resolve, reject) => {
          let store = this.navParams.get('store');
          if (store) {
            this.item = store;
            this.isNew = false;
            this.action = 'Edit';

            // load registers/POS
            this.posService.findBy({ selector: { storeId: this.item._id } }).then((registers) => {
              if (registers && registers.length) {
                this.registers = registers;
              }
              resolve();
            }).catch((error) => {
              reject(new Error(error));
            });
          } else {
            resolve();
          }
        }),
        // load countries list
        new Promise((resolve, reject) => {
          this.http.get('assets/countries.json')
            .subscribe(res => {
              this.countries = res.json();
              resolve();
            });
        })
      ];

      Promise.all(promises).then(function () {
        loader.dismiss();
      });

    });
  }

  onSubmit() {
    console.log(this.item);
    if (this.isNew) {
      this.storeService.add(this.item)
        .catch(console.error.bind(console));
    } else {
      this.storeService.update(this.item)
        .catch(console.error.bind(console));
    }
    this.navCtrl.pop();
  }

  public showPos(pos: POS) {
    this.navCtrl.push(PosDetailsPage, {
      pos: pos,
      storeId: this.item._id
    });
  }

  public addRegister() {
    this.navCtrl.push(PosDetailsPage, {
      pos: null,
      storeId: this.item._id
    });
  }

  public remove() {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete this store ?',
      message: 'Deleting this store, will delete all associated Registers, Sales and any Current Sale!',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            let loader = this.loading.create({
              content: 'Deleting. Please Wait!',
            });

            loader.present().then(() => {
              this.storeService.delete(this.item, true /* Delete all Associations */).then(() => {
                let toast = this.toastCtrl.create({
                  message: 'Store has been deleted successfully',
                  duration: 3000
                });
                toast.present();
                this.navCtrl.pop();
              }).catch(error => {
                let errorMsg = error.hasOwnProperty('error_msg') ? error.error_msg : 'Error while deleting store. Please try again!';
                let alert = this.alertCtrl.create({
                  title: 'Error',
                  subTitle: errorMsg,
                  buttons: ['OK']
                });
                alert.present();
              }).then(() => loader.dismiss());
            });
          }
        }, 'No'
      ]
    });

    confirm.present();
  }
}
