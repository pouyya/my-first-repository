import { PriceBookService } from './../../services/priceBookService';
import { PriceBook } from './../../model/priceBook';
import { UserService } from './../../services/userService';
import { Product } from './../../model/product';
import { CategoryIconSelectModal } from './../category-details/modals/category-icon-select/category-icon-select';
import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, ViewController, Platform, ModalController } from 'ionic-angular';
import { ProductService } from '../../services/productService';
import { CategoryService } from '../../services/categoryService';
import { icons } from './../../metadata/itemIcons';

interface ItemPrice {
	priceBook: PriceBook,
	tax: any, /* Sales Tax */
	retailPriceTax: number
}

@Component({
	templateUrl: 'product-details.html'
})
export class ProductDetails {
	public productItem: Product = new Product();
	public defaultPriceBook: ItemPrice = {
		priceBook: new PriceBook(),
		tax: {},
		retailPriceTax: 0
	};
	public priceBooks: Array<ItemPrice> = [];
	public salesTaxes: Array<any> = [];
	public categories = [];
	public isNew = true;
	public action = 'Add';
	public selectedIcon: string = "";
	public icons: any;

	constructor(public navCtrl: NavController,
		private productService: ProductService,
		private categoryService: CategoryService,
		private userService: UserService,
		private priceBookService: PriceBookService,
		private platform: Platform,
		private navParams: NavParams,
		private zone: NgZone,
		private viewCtrl: ViewController,
		private modalCtrl: ModalController) {
		this.icons = icons;
		// TODO: These will be removed with real taxes from database later
		this.salesTaxes = [
			{ _id: "1", name: "Default Tax", rate: 0 },
			{ _id: "2", name: "General Sales Tax", rate: 10 },
			{ _id: "3", name: "Super Tax", rate: 15 }
		];
		this.defaultPriceBook.priceBook.purchasableItemId = this.productItem._id;
		this.defaultPriceBook.tax = this.salesTaxes[0];
	}

	ionViewDidLoad() {
		let editProduct = this.navParams.get('item');
		if (editProduct) {
			this.productItem = editProduct;
			this.isNew = false;
			this.action = 'Edit';
			if (this.productItem.hasOwnProperty('icon') && this.productItem.icon) {
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
			if (data.status) {
				this.selectedIcon = data.selected;
				this.productItem.icon = this.icons[this.selectedIcon];
			}
		});
		modal.present();
	}

	public onRetailPriceChange(itemPrice: ItemPrice) {
		itemPrice.priceBook.supplyPrice = 0;
		itemPrice.priceBook.markup = 0;
		this.onSalesTaxChange(itemPrice);
	}

	public onSupplyPriceChange(itemPrice: ItemPrice) {
		itemPrice.priceBook.retailPrice = itemPrice.priceBook.markup > 0 ?
			this.priceBookService.calculateRetailPriceTaxInclusive(
				Number(itemPrice.priceBook.supplyPrice), Number(itemPrice.priceBook.markup)
			) : Number(itemPrice.priceBook.supplyPrice);
		this.onSalesTaxChange(itemPrice);
	}

	public onMarkupChange(itemPrice: ItemPrice) {
		if (itemPrice.priceBook.supplyPrice > 0) {
			itemPrice.priceBook.retailPrice = this.priceBookService.calculateRetailPriceTaxInclusive(
				Number(itemPrice.priceBook.supplyPrice), Number(itemPrice.priceBook.markup)
			);
			this.onSalesTaxChange(itemPrice);
		}
	}

	public onSalesTaxChange(itemPrice: ItemPrice) {
		itemPrice.retailPriceTax = this.priceBookService.calculateRetailPriceTaxInclusive(
			Number(itemPrice.priceBook.retailPrice), Number(itemPrice.tax.rate)
		);
	}

	public onRetailPriceTaxInclusiveChange(itemPrice: ItemPrice) {
		itemPrice.priceBook.supplyPrice = 0;
		itemPrice.priceBook.markup = 0;
		itemPrice.priceBook.retailPrice = this.priceBookService.calculateRetailPriceTaxExclusive(
			Number(itemPrice.retailPriceTax), Number(itemPrice.tax.rate)
		);
	}

	saveProducts() {
		if (this.isNew) {
			this.productService.add(this.productItem).then(() => {
				let priceBook = this.defaultPriceBook.priceBook;
				priceBook.salesTaxId = this.defaultPriceBook.tax._id;
				this.priceBookService.add(priceBook)
					.catch(console.error.bind(console));
			})
				.catch(console.error.bind(console));
		} else {
			this.productService.update(this.productItem)
				.catch(console.error.bind(console));
		}
		this.navCtrl.pop();
	}

}
