import { AddSupplierAndStore } from './modals/addSupplierAndStore/addSupplierAndStore';
import { StoreService } from './../../services/storeService';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { SupplierService } from '../../services/supplierService';
import { Supplier } from '../../model/supplier';
import { Store } from '../../model/store';

@Component({
  selector: 'order-details',
  templateUrl: 'order-details.html',
  styles: [`
    .center-message {
      text-align: center;
      font-size: 40px;
      font-weight: bold;
    }
  `]
})
export class OrderDetails {

  public order: any = {};
  public supplier: Supplier = new Supplier();
  public store: Store = new Store();

  constructor(
    private navParams: NavParams,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private supplierService: SupplierService,
    private storeService: StoreService
  ) {
    this.order = navParams.get('order');
  }

  async ionViewDidLoad() {
    let loader = this.loadingCtrl.create({ content: 'Loading your Order...' });
    await loader.present();
    let loadEssentials: any[] = [
      this.supplierService.getAll(),
      this.storeService.getAll()
    ];

    let [suppliers, stores] = await Promise.all(loadEssentials);
    loader.dismiss();
    let pushCallback = params => {
      return new Promise((resolve, reject) => {
        if (params) {
          this.supplier = params.supplier;
          this.store = params.store;
        }
        resolve();
      });
    }
    this.navCtrl.push(AddSupplierAndStore, { suppliers, stores, callback: pushCallback });
  }

}