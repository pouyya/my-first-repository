import { NavParams, NavController, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { PosService } from './../../services/posService';
import { POS } from './../../model/pos';
import { Component } from '@angular/core';
import { SyncContext } from "../../services/SyncContext";
import { DeviceService } from "../../services/deviceService";
import { Device, DeviceType } from './../../model/device';
import { ProductService } from "../../services/productService";
import { ServiceService } from "../../services/serviceService";

@Component({
  selector: "device-details",
  templateUrl: 'device-details.html'
})
export class DeviceDetailsPage {
  public device: Device = new Device();
  public posList: POS[] = [];
  public associatedPurchasableItems = [];
  public isNew: boolean = true;
  public action: string = 'Add';
  private navPopCallback: any;
  public typeList: any = [
    { value: DeviceType.Bump, text: 'Bump' }
  ];
  public purchasableItems = [];

  constructor(
    private navParams: NavParams,
    private posService: PosService,
    private deviceService: DeviceService,
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

  public async onSubmit() {
    this.device.associatedPurchasableItemIds = this.associatedPurchasableItems.map(data => data._id);
    this.device.storeId = this.syncContext.currentStore._id;
    if (this.isNew) {
      await this.navPopCallback(this.device);
      this.navCtrl.pop();
    } else {
      await this.deviceService.update(this.device);
      this.navCtrl.pop();
    }
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

              loader.present().then(() => {
                this.deviceService.delete(this.device).then(() => {
                  let toast = this.toastCtrl.create({
                    message: 'Device has been deleted successfully',
                    duration: 3000
                  });
                  toast.present();
                  this.navCtrl.pop();
                }).catch(error => {
                  throw new Error(error);
                }).then(() => loader.dismiss());
              });
          }
        }, 'No'
      ]
    });

    confirm.present();
  }
}