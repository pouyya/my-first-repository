import {
    NavParams, NavController, ToastController, AlertController, LoadingController,
    ViewController
} from 'ionic-angular';
import { PosService } from './../../../services/posService';
import { POS } from './../../../model/pos';
import { Component } from '@angular/core';
import { SyncContext } from "../../../services/SyncContext";
import { DeviceType } from './../../../model/store';
import { ProductService } from "../../../services/productService";
import { ServiceService } from "../../../services/serviceService";


@Component({
  selector: "device-details-modal",
  templateUrl: 'device-details.html'
})
export class DeviceDetailsModal {
  public device: any = {};
  public posList: POS[] = [];
  public associatedPurchasableItems = [];
  public isNew: boolean = true;
  public action: string = 'Add';
  private navPopCallback: any;
  public deviceType = DeviceType;
  public typeList: any = [
    { value: DeviceType.Bump, text: 'Bump' },
    { value: DeviceType.ProductionLinePrinter, text: 'Production Line Printer' },
  ];
  public purchasableItems = [];

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private posService: PosService,
    private productService: ProductService,
    private serviceService: ServiceService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private syncContext: SyncContext,
    private loading: LoadingController
  ) { }

  async ionViewDidLoad() {
    let loader = this.loading.create({
      content: 'Loading Device...'
    });

    await loader.present();

    let device = this.navParams.get('device');
    this.posList = await this.posService.getCurrentStorePos();
    let data = await Promise.all([this.productService.getAll(), this.serviceService.getAll()]);
    this.purchasableItems = [...data[0], ...data[1]];


    this.navPopCallback = this.navParams.get("pushCallback");
    if (device && device._id !== "") {
      this.isNew = false;
      this.action = 'Edit';
      this.device = device;
      this.associatedPurchasableItems = this.purchasableItems.filter( item => {
        if((this.device.associatedPurchasableItemIds as any).includes(item._id)){
          return item;
        }
      })
    }
    loader.dismiss();
  }

  public dismiss() {
      this.viewCtrl.dismiss(null);
  }

  public async onSubmit() {
    this.device.associatedPurchasableItemIds = this.associatedPurchasableItems.map(data => data._id);
    this.viewCtrl.dismiss({ status : 'add', device: this.device});
  }

  public async remove( ) {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete this Device ?',
      message: 'Deleting this device!',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
              let loader = this.loading.create({
                content: 'Deleting. Please Wait!',
              });
              this.viewCtrl.dismiss({ status : 'remove', device: this.device});
          }
        }, 'No'
      ]
    });

    confirm.present();
  }
}