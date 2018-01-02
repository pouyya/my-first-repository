import { Supplier } from './../../../../model/supplier';
import { NavParams, ModalController, NavController } from 'ionic-angular';
import { Component } from '@angular/core';
import { Store } from '../../../../model/store';
import { CreateSupplier } from '../createSupplier/createSupplier';

@Component({
  selector: 'add-supplier-and-store',
  templateUrl: 'add-supplier-and-store.html'
})
export class AddSupplierAndStore {

  public suppliers: Supplier[] = [];
  public stores: Store[] = [];

  public selectedSupplier: Supplier;
  public selectedStore: Store;

  private navPopCallback: any;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private modalCtrl: ModalController
  ) {
    // this.suppliers = navParams.get('suppliers');
    this.stores = navParams.get('stores');
    this.navPopCallback = navParams.get('callback');
  }

  ionViewDidLeave() {
    this.navPopCallback({
      supplier: this.selectedSupplier,
      store: this.selectedStore
    });
  }

  public addSupplier() {
    let modal = this.modalCtrl.create(CreateSupplier);
    modal.onDidDismiss((supplier: Supplier) => {
      if (supplier) {
        this.selectedSupplier = supplier;
        this.suppliers.push(supplier);
      }
    });
    modal.present();
  }
}