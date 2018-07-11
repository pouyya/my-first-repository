import {
  NavParams, AlertController, LoadingController,
  ViewController, ToastController
} from 'ionic-angular';
import { Component } from '@angular/core';
import { SyncContext } from "../../../services/SyncContext";
import { DeviceType, POS } from './../../../model/store';
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
    { value: DeviceType.ReceiptPrinter, text: 'Receipt Printer' }
  ];
  public purchasableItems = [];
  public IpColor: string = 'black';

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private productService: ProductService,
    private serviceService: ServiceService,
    private alertCtrl: AlertController,
    private syncContext: SyncContext,
    private loading: LoadingController,
    private toastController: ToastController,
  ) { }

  async ionViewDidLoad() {
    let loader = this.loading.create({
      content: 'Loading Device...'
    });

    await loader.present();

    let device = this.navParams.get('device');
    this.posList = this.syncContext.currentStore.POS || [];
    let data = await Promise.all([this.productService.getAll(), this.serviceService.getAll()]);
    this.purchasableItems = [...data[0], ...data[1]].filter(item => !item.isModifier);

    this.navPopCallback = this.navParams.get("pushCallback");
    if (device && device._id !== "") {
      this.isNew = false;
      this.action = 'Edit';
      this.device = device;
      this.associatedPurchasableItems = this.purchasableItems.filter(item => {
        if ((this.device.associatedPurchasableItemIds as any).includes(item._id)) {
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
    this.viewCtrl.dismiss({ status: 'add', device: this.device });
  }

  public async remove() {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete this Device ?',
      message: 'Deleting this device!',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.loading.create({
              content: 'Deleting. Please Wait!',
            });
          }
        }, 'No'
      ]
    });

    confirm.present();
  }

  validateIP(flag) {
    if (this.ValidateIPaddress(this.device.ipAddress))
      this.IpColor = "green";
    else
      this.IpColor = "red";
    if (flag == 1 && this.IpColor == "red") {
      let toast = this.toastController.create({
        message: "missing any set of digits? for printer ip address",
        duration: 3000
      });
      toast.present();
    }
  }
  
  ValidateIPaddress(ipaddress) {
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(this.device.ipAddress)) {
      return (true)
    }
    return (false)
  }

}