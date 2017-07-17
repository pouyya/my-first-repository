import { UserService } from './../../services/userService';
import { CategoryIconSelectModal } from './../category-details/modals/category-icon-select/category-icon-select';
import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, ViewController, Platform, ModalController } from 'ionic-angular';
import { CategoryService } from '../../services/categoryService';
import { ServiceService } from '../../services/serviceService';
import { icons } from './../../metadata/itemIcons';

@Component({
  selector: 'page-variables',
  templateUrl: 'service-details.html'
})
export class ServiceDetails {
  public serviceItem: any = {};
  public categories = [];
  public isNew = true;
  public action = 'Add';
  public selectedIcon: string = "";
	public icons: any;

  constructor(public navCtrl: NavController,
    private serviceService: ServiceService,
    private categoryService: CategoryService,
    private userService: UserService,
    public navParams: NavParams,
    private zone: NgZone,
    private platform: Platform,
    private viewCtrl: ViewController,
    private modalCtrl: ModalController) {
      this.icons = icons;

  }

  ionViewDidLoad() {
    let editProduct = this.navParams.get('service');
    if (editProduct) {
      this.serviceItem = editProduct;
      this.isNew = false;
      this.action = 'Edit';
      if(this.serviceItem.hasOwnProperty('icon') && this.serviceItem.icon) {
        this.selectedIcon = this.serviceItem.icon.name;
      }	      
    } else {
			let user = this.userService.getLoggedInUser();
			this.serviceItem.icon = user.settings.defaultIcon;
			this.selectedIcon = this.serviceItem.icon.name;
    }
    
    this.platform.ready().then(() => {

      this.categoryService.getAll()
        .then(data => {
          this.zone.run(() => {
            this.categories = data;
            console.log('Category Datas in ServiceDetails Page===', data);
          });
        })
        .catch(console.error.bind(console));
    });

  }

  public selectIcon() {
    let modal = this.modalCtrl.create(CategoryIconSelectModal, { selectedIcon: this.selectedIcon });
    modal.onDidDismiss(data => {
      if(data.status) {
        this.selectedIcon = data.selected;
        this.serviceItem.icon = this.icons[this.selectedIcon];
      }
    });
    modal.present();    
  }


  saveService() {
    if (this.isNew) {
      this.serviceService.add(this.serviceItem)
        .catch(console.error.bind(console));
    } else {
      this.serviceService.update(this.serviceItem)
        .catch(console.error.bind(console));
    }

    this.navCtrl.pop();

  }
}
