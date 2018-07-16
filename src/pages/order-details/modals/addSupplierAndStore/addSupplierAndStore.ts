import { StoreService } from './../../../../services/storeService';
import { SupplierService } from './../../../../services/supplierService';
import { Supplier } from './../../../../model/supplier';
import { NavParams, ModalController } from 'ionic-angular';
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

  public selectedSupplier: Supplier = null;
  public selectedStore: Store = null;

  private navPopCallback: any;

  constructor(
    private supplierService: SupplierService,
    private storeService: StoreService,
    private navParams: NavParams,
    private modalCtrl: ModalController
  ) {
    this.navPopCallback = this.navParams.get('callback');
  }

  async ionViewDidLoad() {
    [ this.suppliers, this.stores ] = [
      await this.supplierService.getAll(),
      await this.storeService.getAll()
    ];
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