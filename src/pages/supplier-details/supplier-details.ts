import { ValidationHelper } from './../../utility/validationHelper';
import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { Supplier } from '../../model/supplier';
import { SupplierService } from '../../services/supplierService';
import { ResourceService } from '../../services/resourceService';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';

@SecurityModule(SecurityAccessRightRepo.SupplierAddEdit)
@Component({
  selector: 'supplier-details',
  templateUrl: 'supplier-details.html'
})
export class SupplierDetails {

  public supplierForm: FormGroup;
  public supplier: Supplier = new Supplier();
  public countries: any[] = [];
  public isNew: boolean = true;
  public action: string = 'Add';
  public postalSameAsPhysical: boolean = false;
  public pattern: any = {};

  constructor(
    private navCtrl: NavController,
    private supplierService: SupplierService,
    private navParams: NavParams,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private resourceService: ResourceService,
    private formBuilder: FormBuilder
  ) {
    this.pattern.telephone = /^[\+\d]?(?:[\d-.\s()]*)$/
    let supplier = this.navParams.get('supplier');
    if (supplier) {
      this.supplier = supplier;
      this.isNew = false;
      this.action = 'Edit';
      let props: string[] = ['StreetAddr', 'Suburb', 'City', 'State', 'ZipCode', 'Country'];
      let copyToPrefix: string = 'pos';
      let copyFromPrefix: string = 'phy';
      for (let i = 0; i < props.length; i++) {
        if (this.supplier[`${copyToPrefix}${props[i]}`] !== this.supplier[`${copyFromPrefix}${props[i]}`]) {
          this.postalSameAsPhysical = false;
          break;
        } else {
          this.postalSameAsPhysical = true;
        }
      }
    }
    this.createForm();
  }

  async ionViewDidLoad() {
    this.countries = await this.resourceService.getCountries();
  }

  get name() { return this.supplierForm.get('name'); }
  get description() { return this.supplierForm.get('description'); }
  get firstName() { return this.supplierForm.get('firstName'); }
  get lastName() { return this.supplierForm.get('lastName'); }
  get cellphone() { return this.supplierForm.get('cellphone'); }
  get telephone() { return this.supplierForm.get('telephone'); }
  get email() { return this.supplierForm.get('email'); }
  get website() { return this.supplierForm.get('website'); }
  get phyStreetAddr() { return this.supplierForm.get('phyStreetAddr'); }
  get phySuburb() { return this.supplierForm.get('phySuburb'); }
  get phyCity() { return this.supplierForm.get('phyCity'); }
  get phyState() { return this.supplierForm.get('phyState'); }
  get phyZipCode() { return this.supplierForm.get('phyZipCode'); }
  get phyCountry() { return this.supplierForm.get('phyCountry'); }
  get posStreetAddr() { return this.supplierForm.get('posStreetAddr'); }
  get posSuburb() { return this.supplierForm.get('posSuburb'); }
  get posCity() { return this.supplierForm.get('posCity'); }
  get posState() { return this.supplierForm.get('posState'); }
  get posZipCode() { return this.supplierForm.get('posZipCode'); }
  get posCountry() { return this.supplierForm.get('posCountry'); }

  private createForm() {
    this.supplierForm = this.formBuilder.group({
      name: new FormControl(this.supplier.name, [Validators.required]),
      description: new FormControl(this.supplier.description),

      /** Personal Information */
      firstName: new FormControl(this.supplier.firstName),
      lastName: new FormControl(this.supplier.lastName),
      telephone: new FormControl(this.supplier.telephone, [
        Validators.pattern(/^[\+\d]?(?:[\d-.\s()]*)$/) // +999-999-9999
      ]),
      cellphone: new FormControl(this.supplier.cellphone, [
        Validators.pattern(/^[\+\d]?(?:[\d-.\s()]*)$/) // +999-999-9999
      ]),
      email: new FormControl(this.supplier.email, [ValidationHelper.emptyOrEmail]),
      website: new FormControl(this.supplier.website),

      /** Physical Address */
      phyStreetAddr: new FormControl(this.supplier.phyStreetAddr, []),
      phySuburb: new FormControl(this.supplier.phySuburb, []),
      phyCity: new FormControl(this.supplier.phyCity, []),
      phyState: new FormControl(this.supplier.phyState, []),
      phyZipCode: new FormControl(this.supplier.phyZipCode, []),
      phyCountry: new FormControl(this.supplier.phyCountry, []),

      /** Postal Address */
      posStreetAddr: new FormControl(this.supplier.posStreetAddr, []),
      posSuburb: new FormControl(this.supplier.posSuburb, []),
      posCity: new FormControl(this.supplier.posCity, []),
      posState: new FormControl(this.supplier.posState, []),
      posZipCode: new FormControl(this.supplier.posZipCode, []),
      posCountry: new FormControl(this.supplier.posCountry, []),
    });
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
    Object.keys(this.supplierForm.value).forEach(prop => {
      this.supplier[prop] = this.supplierForm.value[prop];
    });
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