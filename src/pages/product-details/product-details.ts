import { UserService } from './../../services/userService';
import { Product } from './../../model/product';
import { CategoryIconSelectModal } from './../category-details/modals/category-icon-select/category-icon-select';
import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, ViewController, Platform, ModalController } from 'ionic-angular';
import { ProductService } from '../../services/productService';
import { CategoryService } from '../../services/categoryService';
import { icons } from './../../metadata/itemIcons';

@Component({
	templateUrl: 'product-details.html'
})
export class ProductDetails {
	public productItem: Product = new Product();
	public categories = [];
	public isNew = true;
	public action = 'Add';
	public selectedIcon: string = "";
	public icons: any;

	constructor(public navCtrl: NavController,
		private productService: ProductService,
		private categoryService: CategoryService,
		private userService: UserService,
		private platform: Platform,
		private navParams: NavParams,
		private zone: NgZone,
		private viewCtrl: ViewController,
		private modalCtrl: ModalController) {
			this.icons = icons;
	}

	ionViewDidLoad() {
		let editProduct = this.navParams.get('item');
		if (editProduct) {
			this.productItem = editProduct;
			this.isNew = false;
			this.action = 'Edit';
      if(this.productItem.hasOwnProperty('icon') && this.productItem.icon) {
        this.selectedIcon = this.productItem.icon.name;
      }
		} else {
			let user = this.userService.getLoggedInUser();
			this.productItem.icon = user.settings.defaultIcon;
			this.selectedIcon = this.productItem.icon.name;
		}

		this.platform.ready().then(() => {
			this.categoryService.getAll().then(data => {
				this.zone.run(() => {
					this.categories = data;
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
				this.productItem.icon = this.icons[this.selectedIcon];
			}
    });
    modal.present();    
  }

	saveProducts() {
		if (this.isNew) {
			this.productService.add(this.productItem)
				.catch(console.error.bind(console));
		} else {
			this.productService.update(this.productItem)
				.catch(console.error.bind(console));
		}
		this.navCtrl.pop();
	}

}
