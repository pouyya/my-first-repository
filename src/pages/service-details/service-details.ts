import _ from 'lodash';
import { AppSettingsService } from './../../services/appSettingsService';
import { Service } from './../../model/service';
import { SalesTaxService } from './../../services/salesTaxService';
import { PurchasableItemPriceInterface } from './../../model/purchasableItemPrice.interface';
import { PriceBookService } from './../../services/priceBookService';
import { PriceBook } from './../../model/priceBook';
import { UserService } from './../../services/userService';
import { CategoryIconSelectModal } from './../category-details/modals/category-icon-select/category-icon-select';
import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, ViewController, Platform, ModalController, LoadingController } from 'ionic-angular';
import { CategoryService } from '../../services/categoryService';
import { ServiceService } from '../../services/serviceService';
import { icons } from './../../metadata/itemIcons';

interface InteractableItemPriceInterface {
	id: string;
	tax: any,
	item: PurchasableItemPriceInterface,
	isDefault: boolean
}

@Component({
	selector: 'page-variables',
	templateUrl: 'service-details.html'
})
export class ServiceDetails {
	public serviceItem: Service = new Service();
	public priceBooks: Array<InteractableItemPriceInterface> = [];
	public salesTaxes: Array<any> = [];
	public categories = [];
	public isNew = true;
	public action = 'Add';
	public selectedIcon: string = "";
	public icons: any;
	public disableDropdown: boolean = false;
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
	private _user: any;

	constructor(public navCtrl: NavController,
		private serviceService: ServiceService,
		private categoryService: CategoryService,
		private priceBookService: PriceBookService,
		private salesTaxService: SalesTaxService,
		private userService: UserService,
		private appSettingsService: AppSettingsService,
		private navParams: NavParams,
		private zone: NgZone,
		private platform: Platform,
		private viewCtrl: ViewController,
		private modalCtrl: ModalController,
		private loading: LoadingController) {
		this.icons = icons;
		this._user = this.userService.getLoggedInUser();
	}

	ionViewDidLoad() {


		this.platform.ready().then(() => {

			let loader = this.loading.create({
				content: 'Loading Service...',
			});

			loader.present().then(() => {
				let editProduct = this.navParams.get('service');
				if (editProduct) {
					this.serviceItem = editProduct;
					this.isNew = false;
					this.action = 'Edit';
					if (this.serviceItem.hasOwnProperty('icon') && this.serviceItem.icon) {
						this.selectedIcon = this.serviceItem.icon.name;
					}
				} else {
					this.serviceItem.icon = this._user.settings.defaultIcon;
					this.selectedIcon = this.serviceItem.icon.name;
				}
				var promises: Array<Promise<any>> = [
					new Promise((_resolve, _reject) => {
						this.categoryService.getAll()
							.then(data => _resolve(data))
							.catch(error => _reject(error));
					}),
					new Promise((_resolve, _reject) => {
						this.salesTaxService.get(this._user.settings.defaultTax).then((salesTax: any) => {
							salesTax.name = "Account Sales Tax (Default)";
							_resolve({ 
								...salesTax,
								isDefault: true,
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
					})
				];

				Promise.all(promises).then((results: Array<any>) => {
					this.zone.run(() => {
						this.categories = results[0];
						this.salesTaxes.push(results[1]);
						this.salesTaxes = this.salesTaxes.concat(results[2]);
						this._defaultPriceBook = results[3];

						let servicePriceBook = _.find(this._defaultPriceBook.purchasableItems, { id: this.serviceItem._id });

						if (!servicePriceBook) {
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
						} else {
							this.defaultPriceBook = {
								id: this._defaultPriceBook._id,
								isDefault: true,
								tax: servicePriceBook.salesTaxId == null ? this.salesTaxes[0] : _.find(this.salesTaxes, { _id: servicePriceBook.salesTaxId }),
								item: servicePriceBook
							};

						}
						loader.dismiss();
					});
				});
			});
		});

	}

	public selectIcon() {
		let modal = this.modalCtrl.create(CategoryIconSelectModal, { selectedIcon: this.selectedIcon });
		modal.onDidDismiss(data => {
			if (data.status) {
				this.selectedIcon = data.selected;
				this.serviceItem.icon = this.icons[this.selectedIcon];
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
		let oldPrice = itemPrice.item.inclusivePrice;
		itemPrice.item.inclusivePrice = this.priceBookService.calculateRetailPriceTaxInclusive(
			Number(itemPrice.item.retailPrice), Number(itemPrice.tax.rate)
		);
		if (oldPrice != itemPrice.item.inclusivePrice) {
			// update the price
			this.disableDropdown = true;
			let index = _.findIndex(this._defaultPriceBook.purchasableItems, { id: this.serviceItem._id });
			let dBuffer = {
				id: this.serviceItem._id,
				retailPrice: Number(this.defaultPriceBook.item.retailPrice),
				inclusivePrice: Number(this.defaultPriceBook.item.inclusivePrice),
				supplyPrice: Number(this.defaultPriceBook.item.supplyPrice),
				markup: Number(this.defaultPriceBook.item.markup),
				salesTaxId: this.defaultPriceBook.tax.hasOwnProperty('isDefault') && this.defaultPriceBook.tax.isDefault ? null : this.defaultPriceBook.tax._id,
				saleTaxEntity: this.defaultPriceBook.tax.entityTypeName
			};

			index > -1 ? this._defaultPriceBook.purchasableItems[index] = dBuffer :
				this._defaultPriceBook.purchasableItems.push(dBuffer);

			this.priceBookService.update(this._defaultPriceBook)
				.then(() => this.disableDropdown = false)
				.catch(() => this.disableDropdown = false);
		}		
	}

	public onRetailPriceTaxInclusiveChange(itemPrice: InteractableItemPriceInterface) {
		itemPrice.item.supplyPrice = 0;
		itemPrice.item.markup = 0;
		itemPrice.item.retailPrice = this.priceBookService.calculateRetailPriceTaxExclusive(
			Number(itemPrice.item.inclusivePrice), Number(itemPrice.tax.rate)
		);
	}


	saveService() {
		if (this.isNew) {
			this.serviceService.add(this.serviceItem).then((res) => {
				var promises: Array<Promise<any>> = [
					new Promise((_resolve, _reject) => {
						this._defaultPriceBook.purchasableItems.push({
							id: res.id,
							retailPrice: Number(this.defaultPriceBook.item.retailPrice),
							inclusivePrice: Number(this.defaultPriceBook.item.inclusivePrice),
							supplyPrice: Number(this.defaultPriceBook.item.supplyPrice),
							markup: Number(this.defaultPriceBook.item.markup),
							salesTaxId: this.defaultPriceBook.tax.hasOwnProperty('isDefault') && this.defaultPriceBook.tax.isDefault ? null : this.defaultPriceBook.tax._id,
							saleTaxEntity: this.defaultPriceBook.tax.entityTypeName
						});
						this.priceBookService.update(this._defaultPriceBook)
							.then(() => _resolve()).catch(error => _reject(error));
					})
				];

				Promise.all(promises).catch(console.error.bind(console));

			}).catch(console.error.bind(console));
		} else {
			this.serviceService.update(this.serviceItem).then((res) => {
				var promises: Array<Promise<any>> = [
					new Promise((_resolve, _reject) => {
						let index = _.findIndex(this._defaultPriceBook.purchasableItems, { id: this.serviceItem._id });
						let dBuffer = {
							id: this.serviceItem._id,
							retailPrice: Number(this.defaultPriceBook.item.retailPrice),
							inclusivePrice: Number(this.defaultPriceBook.item.inclusivePrice),
							supplyPrice: Number(this.defaultPriceBook.item.supplyPrice),
							markup: Number(this.defaultPriceBook.item.markup),
							salesTaxId: this.defaultPriceBook.tax.hasOwnProperty('isDefault') && this.defaultPriceBook.tax.isDefault ? null : this.defaultPriceBook.tax._id,
							saleTaxEntity: this.defaultPriceBook.tax.entityTypeName
						};

						index > -1 ? this._defaultPriceBook.purchasableItems[index] = dBuffer :
							this._defaultPriceBook.purchasableItems.push(dBuffer);

						this.priceBookService.update(this._defaultPriceBook)
							.then(() => _resolve()).catch(error => _reject(error));
					})
				];

				Promise.all(promises).catch(console.error.bind(console));
			}).catch(console.error.bind(console));
		}

		this.navCtrl.pop();

	}
}
