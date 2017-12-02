import _ from 'lodash';
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
import { HelperService } from "../../services/helperService";
import { AppService } from "../../services/appService";

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
		private helperService: HelperService,
		private appService: AppService,
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
					this.categoryService.getAll(),
					new Promise((_resolve, _reject) => {
						this.salesTaxService.get(this._user.settings.defaultTax).then((salesTax: any) => {
							salesTax.name = ` ${salesTax.name} (Default)`;
							_resolve({
								...salesTax,
								isDefault: true,
								noOfTaxes: salesTax.entityTypeName == 'GroupSaleTax' ? salesTax.salesTaxes.length : 0
							});
						}).catch(error => {
							if (error.name == "not_found") {
								_resolve(null);
							} else _reject(error);
						});
					}),
					this.appService.loadSalesAndGroupTaxes(),
					this.priceBookService.getDefault()
				];

				Promise.all(promises).then((results: Array<any>) => {
					this.zone.run(() => {
						this.categories = results[0];
						results[1] != null && this.salesTaxes.push(results[1]);
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

	public calculate(type, itemPrice: InteractableItemPriceInterface) {
		this.zone.runOutsideAngular(() => {
			switch (type) {
				case 'supplyPrice':
					itemPrice.item.markup = this.priceBookService.calculateMarkup(itemPrice.item.supplyPrice, itemPrice.item.retailPrice);
					break;
				case 'markup':
					if (itemPrice.item.supplyPrice !== 0) {
						itemPrice.item.retailPrice = this.priceBookService.calculateRetailPriceTaxInclusive(
							Number(itemPrice.item.supplyPrice), Number(itemPrice.item.markup)
						);
						itemPrice.item.inclusivePrice = this.priceBookService.calculateRetailPriceTaxInclusive(
							Number(itemPrice.item.retailPrice), Number(itemPrice.tax.rate)
						);
					}
					break;
				case 'retailPrice':
					itemPrice.item.markup = this.priceBookService.calculateMarkup(itemPrice.item.supplyPrice, itemPrice.item.retailPrice);
					itemPrice.item.inclusivePrice = this.priceBookService.calculateRetailPriceTaxInclusive(
						Number(itemPrice.item.retailPrice), Number(itemPrice.tax.rate)
					);
					break;
				case 'salesTax':
					itemPrice.item.inclusivePrice = this.priceBookService.calculateRetailPriceTaxInclusive(
						Number(itemPrice.item.retailPrice), Number(itemPrice.tax.rate)
					);
					break;
				case 'inclusivePrice':
					itemPrice.item.retailPrice = this.priceBookService.calculateRetailPriceTaxExclusive(
						Number(itemPrice.item.inclusivePrice), Number(itemPrice.tax.rate)
					);
					itemPrice.item.markup = this.priceBookService.calculateMarkup(itemPrice.item.supplyPrice, itemPrice.item.retailPrice);
					break;
			}
		});
	}

	async saveService() {

		let createPurchsableItem = (piId: string) => {
			let puchasableItem: PurchasableItemPriceInterface = {
				id: piId,
				retailPrice: Number(this.defaultPriceBook.item.retailPrice),
				inclusivePrice: Number(this.defaultPriceBook.item.inclusivePrice),
				supplyPrice: Number(this.defaultPriceBook.item.supplyPrice),
				markup: Number(this.defaultPriceBook.item.markup),
				salesTaxId: this.defaultPriceBook.tax.hasOwnProperty('isDefault') && this.defaultPriceBook.tax.isDefault ? null : this.defaultPriceBook.tax._id,
				saleTaxEntity: this.defaultPriceBook.tax.entityTypeName
			};

			return puchasableItem;
		}

		if (this.isNew) {
			var res = await this.serviceService.add(this.serviceItem);
			this._defaultPriceBook.purchasableItems.push(createPurchsableItem(res.id));

		} else {
			await this.serviceService.update(this.serviceItem);
			let index = _.findIndex(this._defaultPriceBook.purchasableItems, { id: this.serviceItem._id });
			let dBuffer = createPurchsableItem(this.serviceItem._id);

			index > -1 ? this._defaultPriceBook.purchasableItems[index] = dBuffer :
				this._defaultPriceBook.purchasableItems.push(dBuffer);
		}
		
		await this.priceBookService.update(this._defaultPriceBook);
		this.navCtrl.pop();
	}
}
