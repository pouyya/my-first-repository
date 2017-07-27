import { AppSettingsService } from './../../services/appSettingsService';
import _ from 'lodash';
import { SalesTaxService } from './../../services/salesTaxService';
import { SalesTax } from './../../model/salesTax';
import { PurchasableItemPriceInterface } from './../../model/purchasableItemPrice.interface';
import { PriceBookService } from './../../services/priceBookService';
import { PriceBook } from './../../model/priceBook';
import { UserService } from './../../services/userService';
import { Product } from './../../model/product';
import { CategoryIconSelectModal } from './../category-details/modals/category-icon-select/category-icon-select';
import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, ViewController, Platform, ModalController, LoadingController } from 'ionic-angular';
import { ProductService } from '../../services/productService';
import { CategoryService } from '../../services/categoryService';
import { icons } from './../../metadata/itemIcons';

interface InteractableItemPriceInterface {
	id: string;
	tax: any,
	item: PurchasableItemPriceInterface,
	isDefault: boolean
}

@Component({
	templateUrl: 'product-details.html'
})
export class ProductDetails {
	public productItem: Product = new Product();
	public priceBooks: Array<InteractableItemPriceInterface> = [];
	public salesTaxes: Array<any> = [];
	public categories = [];
	public isNew = true;
	public action = 'Add';
	public selectedIcon: string = "";
	public icons: any;
	public defaultPriceBook: InteractableItemPriceInterface = {
		id: "",
		tax: {},
		item: {
			id: "",
			retailPrice: 0,
			inclusivePrice: 0,
			supplyPrice: 0,
			markup: 0,
			salesTaxId: ""
		},
		isDefault: false
	};
	private _defaultPriceBook: PriceBook;
	private _priceBooks: Array<PriceBook>;
	private _user: any;

	constructor(public navCtrl: NavController,
		private productService: ProductService,
		private categoryService: CategoryService,
		private userService: UserService,
		private priceBookService: PriceBookService,
		private salesTaxService: SalesTaxService,
		private appSettingsService: AppSettingsService,
		private platform: Platform,
		private navParams: NavParams,
		private loading: LoadingController,
		private zone: NgZone,
		private viewCtrl: ViewController,
		private modalCtrl: ModalController) {
		this.icons = icons;
	}

	ionViewDidLoad() {
		this.platform.ready().then(() => {

			let loader = this.loading.create({
				content: 'Loading Product...',
			});

			loader.present().then(() => {
				let editProduct = this.navParams.get('item');
				this._user = this.userService.getLoggedInUser();
				if (editProduct) {
					this.productItem = editProduct;
					this.isNew = false;
					this.action = 'Edit';
					if (this.productItem.hasOwnProperty('icon') && this.productItem.icon) {
						this.selectedIcon = this.productItem.icon.name;
					}
				} else {
					this.productItem.icon = this._user.settings.defaultIcon;
					this.selectedIcon = this.productItem.icon.name;
				}
				var promises: Array<Promise<any>> = [
					new Promise((_resolve, _reject) => {
						this.categoryService.getAll().then(data => _resolve(data))
							.catch(error => _reject(error));
					}),
					new Promise((_resolve, _reject) => {
						this.salesTaxService.get(this._user.settings.defaultTax).then((salesTax: any) => {
							salesTax.name = "Account Sales Tax (Default)";
							_resolve({ 
								...salesTax,
								noOfTaxes: salesTax.entityTypeName == 'GroupSaleTax' ? salesTax.salesTaxes.length : 0  });
						}).catch(error => _reject(error));
					}),
					new Promise((_resolve, _reject) => {
						this.appSettingsService.loadSalesAndGroupTaxes().then((salesTaxes: Array<any>) => {
							_resolve(salesTaxes);
						}).catch(error => _reject(error));
					}),
					new Promise((_resolve, _reject) => {
						this.priceBookService.getDefaultPriceBook().then((priceBook: PriceBook) => {
							_resolve(priceBook);
						}).catch(error => _reject(error));
					}),
					new Promise((_resolve, _reject) => {
						this.priceBookService.getPriceBooks().then((priceBooks: PriceBook) => {
							_resolve(priceBooks);
						}).catch(error => _reject(error));
					})
				];

				Promise.all(promises).then((results: Array<any>) => {
					this.zone.run(() => {
						this.categories = results[0];
						this.salesTaxes.push(results[1]);
						this.salesTaxes =  this.salesTaxes.concat(results[2]);
						this._defaultPriceBook = results[3];
						this._priceBooks = results[4];

						let productPriceBook = _.find(this._defaultPriceBook.purchasableItems, { id: this.productItem._id });

						if (!productPriceBook) {
							this.defaultPriceBook = {
								id: this._defaultPriceBook._id,
								isDefault: true,
								tax: this.salesTaxes[0],
								item: {
									id: "",
									retailPrice: 0,
									inclusivePrice: 0,
									salesTaxId: "", // will set upon save
									supplyPrice: 0,
									markup: 0
								}
							};

							this._priceBooks.forEach((priceBook: PriceBook) => {
								this.priceBooks.push({
									id: priceBook._id,
									isDefault: false,
									tax: this.salesTaxes[0],
									item: {
										id: "",
										retailPrice: 0,
										inclusivePrice: 0,
										salesTaxId: "", // will set upon save
										supplyPrice: 0,
										markup: 0
									}
								});
							});
						} else {
							this.defaultPriceBook = {
								id: this._defaultPriceBook._id,
								isDefault: true,
								tax: _.find(this.salesTaxes, { _id: productPriceBook.salesTaxId }),
								item: productPriceBook
							};

							this._priceBooks.forEach((priceBook: PriceBook) => {
								productPriceBook = _.find(priceBook.purchasableItems, { id: this.productItem._id });
								this.priceBooks.push({
									id: priceBook._id,
									isDefault: false,
									tax: _.find(this.salesTaxes, { _id: productPriceBook.salesTaxId }),
									item: productPriceBook
								});
							});

						}
						loader.dismiss();

					});
				}).catch(console.error.bind(console));
			});

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


	public onRetailPriceChange(itemPrice: InteractableItemPriceInterface) {
		itemPrice.item.supplyPrice = 0;
		itemPrice.item.markup = 0;
		this.onSalesTaxChange(itemPrice);
	}

	public onSupplyPriceChange(itemPrice: InteractableItemPriceInterface) {
		itemPrice.item.retailPrice = itemPrice.item.markup > 0 ?
			this.priceBookService.calculateRetailPriceTaxInclusive(
				Number(itemPrice.item.supplyPrice), Number(itemPrice.item.markup)
			) : Number(itemPrice.item.supplyPrice);
		this.onSalesTaxChange(itemPrice);
	}

	public onMarkupChange(itemPrice: InteractableItemPriceInterface) {
		if (itemPrice.item.supplyPrice > 0) {
			itemPrice.item.retailPrice = this.priceBookService.calculateRetailPriceTaxInclusive(
				Number(itemPrice.item.supplyPrice), Number(itemPrice.item.markup)
			);
			this.onSalesTaxChange(itemPrice);
		}
	}

	public onSalesTaxChange(itemPrice: InteractableItemPriceInterface) {
		itemPrice.item.inclusivePrice = this.priceBookService.calculateRetailPriceTaxInclusive(
			Number(itemPrice.item.retailPrice), Number(itemPrice.tax.rate)
		);
	}

	public onRetailPriceTaxInclusiveChange(itemPrice: InteractableItemPriceInterface) {
		itemPrice.item.supplyPrice = 0;
		itemPrice.item.markup = 0;
		itemPrice.item.retailPrice = this.priceBookService.calculateRetailPriceTaxExclusive(
			Number(itemPrice.item.inclusivePrice), Number(itemPrice.tax.rate)
		);
	}

	saveProducts() {
		if (this.isNew) {
			this.productService.add(this.productItem).then((res) => {
				var promises: Array<Promise<any>> = [
					new Promise((_resolve, _reject) => {
						this._defaultPriceBook.purchasableItems.push({
							id: res.id,
							retailPrice: Number(this.defaultPriceBook.item.retailPrice),
							inclusivePrice: Number(this.defaultPriceBook.item.inclusivePrice),
							supplyPrice: Number(this.defaultPriceBook.item.supplyPrice),
							markup: Number(this.defaultPriceBook.item.markup),
							salesTaxId: this.defaultPriceBook.tax._id,
							saleTaxEntity: this.defaultPriceBook.tax.entityTypeName
						});
						this.priceBookService.update(this._defaultPriceBook)
							.then(() => _resolve()).catch(error => _reject(error));
					}),
					new Promise((_resolve, _reject) => {
						let priceBookUpdate: Array<Promise<any>> = [];
						this.priceBooks.forEach((priceBook: InteractableItemPriceInterface, index: number) => {
							this._priceBooks[index].purchasableItems.push({
								id: res.id,
								retailPrice: Number(priceBook.item.retailPrice),
								inclusivePrice: Number(priceBook.item.inclusivePrice),
								supplyPrice: Number(priceBook.item.supplyPrice),
								markup: Number(priceBook.item.markup),
								salesTaxId: priceBook.tax._id,
								saleTaxEntity: priceBook.tax.entityTypeName
							});
							priceBookUpdate.push(this.priceBookService.update(this._priceBooks[index]));
						});

						Promise.all(priceBookUpdate)
							.then(() => _resolve()).catch(error => _reject());
					})
				];

				Promise.all(promises).catch(console.error.bind(console));

			}).catch(console.error.bind(console));
		} else {
			this.productService.update(this.productItem).then(() => {
				var promises: Array<Promise<any>> = [
					new Promise((_resolve, _reject) => {
						let index = _.findIndex(this._defaultPriceBook.purchasableItems, { id: this.productItem._id });
						let dBuffer = {
							id: this.productItem._id,
							retailPrice: Number(this.defaultPriceBook.item.retailPrice),
							inclusivePrice: Number(this.defaultPriceBook.item.inclusivePrice),
							supplyPrice: Number(this.defaultPriceBook.item.supplyPrice),
							markup: Number(this.defaultPriceBook.item.markup),
							salesTaxId: this.defaultPriceBook.tax._id,
							saleTaxEntity: this.defaultPriceBook.tax.entityTypeName
						};
						
						index > -1 ? this._defaultPriceBook.purchasableItems[index] = dBuffer : 
						this._defaultPriceBook.purchasableItems.push(dBuffer);

						this.priceBookService.update(this._defaultPriceBook)
							.then(() => _resolve()).catch(error => _reject(error));			
					}),
					new Promise((_resolve, _reject) => {
						let priceBookUpdate: Array<Promise<any>> = [];
						this.priceBooks.forEach((priceBook: InteractableItemPriceInterface, index: number) => {
							let idx = _.findIndex(this._priceBooks[index].purchasableItems, { id: this.productItem._id });
							let dBuffer = {
								id: this.productItem._id,
								retailPrice: Number(priceBook.item.retailPrice),
								inclusivePrice: Number(priceBook.item.inclusivePrice),
								supplyPrice: Number(priceBook.item.supplyPrice),
								markup: Number(priceBook.item.markup),
								salesTaxId: priceBook.tax._id,
								saleTaxEntity: priceBook.tax.entityTypeName
							};
							idx > -1 ? this._priceBooks[index].purchasableItems[idx] = dBuffer :
							this._priceBooks[index].purchasableItems.push(dBuffer);

							priceBookUpdate.push(this.priceBookService.update(this._priceBooks[index]));
						});

						Promise.all(priceBookUpdate)
							.then(() => _resolve()).catch(error => _reject());
					})
				];

				Promise.all(promises).catch(console.error.bind(console));
			})
				.catch(console.error.bind(console));
		}
		this.navCtrl.pop();
	}

}
