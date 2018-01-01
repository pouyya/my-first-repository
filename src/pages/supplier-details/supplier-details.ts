import { Component, SimpleChanges, OnChanges } from '@angular/core';
import { Http } from '@angular/http';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { Supplier } from '../../model/supplier';
import { SupplierService } from '../../services/supplierService';

@Component({
  selector: 'supplier-details',
  templateUrl: 'supplier-details.html'
})
export class SupplierDetails implements OnChanges {

  public supplier: Supplier = new Supplier();
  public countries: any[] = [];
  public isNew: boolean = true;
  public action: string = 'Add';
  public postalSameAsPhysical: boolean = false;

  constructor(
    private http: Http,
    private navCtrl: NavController,
    private supplierService: SupplierService,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    for (let propName in changes) {
      /** Detect changes here */
    }
  }

  async ionViewDidLoad() {
    this.http.get('assets/countries.json')
      .subscribe(res => {
        this.countries = res.json();
      });
    let supplier = this.navParams.get('supplier');
    if (supplier) {
      this.supplier = supplier;
      this.isNew = false;
      this.action = 'Edit';
      let props: string[] = ['StreetAddr', 'Suburb', 'City', 'State', 'ZipCode', 'Country'];
      let copyToPrefix: string = 'pos';
      let copyFromPrefix: string = 'phy';
      for(let i = 0; i < props.length; i++) {
        if(this.supplier[`${copyToPrefix}${props[i]}`] !== this.supplier[`${copyFromPrefix}${props[i]}`]) {
          this.postalSameAsPhysical = false;
          break;
        } else {
          this.postalSameAsPhysical = true;
        }
      }
    }
  }

  public remove() {
    let toast = this.toastCtrl.create({ duration: 3000 });
    let confirm = this.alertCtrl.create({
      title: 'Delete Supplier',
      message: 'Do you wish to delete this supplier',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.supplierService.delete(this.supplier).then(() => {
              toast.setMessage('Supplier successfully delete');
              toast.present();
              this.navCtrl.pop();
            }).catch(err => {
              toast.setMessage('Unable to delete supplier');
              toast.present();
            })
          }
        },
        'No'
      ]
    });
    confirm.present();
  }

  public async save(): Promise<any> {
    try {
      await this.supplierService[this.isNew ? 'add' : 'update'](this.supplier);
      this.navCtrl.pop();
      return;
    } catch (err) {
      throw new Error(err);
    }
  }

  public makePostalSametoPhysical(event) {
    this.postalSameAsPhysical = event.value;
    let props: string[] = ['StreetAddr', 'Suburb', 'City', 'State', 'ZipCode', 'Country'];
    let copyToPrefix: string = 'pos';
    let copyFromPrefix: string = 'phy';
    props.forEach((prop, index) => {
      this.supplier[`${copyToPrefix}${prop}`] = event.value ? this.supplier[`${copyFromPrefix}${prop}`] : '';
    });
  }
}