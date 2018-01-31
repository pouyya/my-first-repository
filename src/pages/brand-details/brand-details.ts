import * as moment from 'moment-timezone';
import { BrandService } from './../../services/brandService';
import { Brand } from './../../model/brand';
import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController, ModalController, ToastController } from 'ionic-angular';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { UserService } from '../../modules/dataSync/services/userService';

@SecurityModule(SecurityAccessRightRepo.BrandAddEdit)
@Component({
  selector: 'brand-details',
  templateUrl: 'brand-details.html'
})
export class BrandDetails {
  public brand: Brand = new Brand();
  public isNew = true;
  public action = 'Add';

  constructor(public navCtrl: NavController,
    private brandService: BrandService,
    private userService: UserService,
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController) {
  }

  async ionViewDidLoad() {
    let brand = <Brand>this.navParams.get('brand');
    if (brand) {
      this.isNew = false; this.action = 'Edit';
      this.brand = brand;
    }
  }

  public async onSubmit() {
    try {
      this.brand.updatedAt = moment().utc().format();
      await this.brandService[this.isNew ? 'add' : 'update'](this.brand);
      let toast = this.toastCtrl.create({
        message: `Brand '${this.brand.name}' has been created successfully!`,
        duration: 3000
      });
      toast.present();
      this.navCtrl.pop();
    } catch (err) {
      throw new Error(err);
    }
  }

  public async delete() {
    try {
      await this.brandService.delete(this.brand);
      let toast = this.toastCtrl.create({
        message: `Brand '${this.brand.name}' has been deleted successfully!`,
        duration: 3000
      });
      toast.present();
      this.navCtrl.pop();
    } catch (err) {
      throw new Error(err);
    }
  }
}