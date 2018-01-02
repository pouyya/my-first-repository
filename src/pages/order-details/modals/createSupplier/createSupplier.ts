import { SupplierService } from './../../../../services/supplierService';
import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { ViewController } from 'ionic-angular';
import { Supplier } from '../../../../model/supplier';

@Component({
  selector: 'create-supplier',
  templateUrl: 'createSupplier.html'
})
export class CreateSupplier {

  public supplier: Supplier = new Supplier();
  public countries: any[] = [];
  public postalSameAsPhysical: boolean = false;

  constructor(
    private http: Http,
    private supplierService: SupplierService,
    private viewCtrl: ViewController
  ) { }

  ionViewDidLoad() {
    this.http.get('assets/countries.json')
      .subscribe(res => {
        this.countries = res.json();
      });
  }

  public async save(): Promise<any> {
    try {
      let info = await this.supplierService.add(this.supplier);
      let data = await this.supplierService.get(info.id);
      this.viewCtrl.dismiss(data);
      return;
    } catch (err) {
      throw new Error(err);
    }
  }

  public dismiss() {
    this.viewCtrl.dismiss();
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