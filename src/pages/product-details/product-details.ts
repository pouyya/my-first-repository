import { Store } from './../../model/store';
import { StockHistoryService } from './../../services/stockHistoryService';
import { StockHistory } from './../../model/stockHistory';
import { StoreService } from './../../services/storeService';
import { BrandService } from './../../services/brandService';
import _ from 'lodash';
import { SalesTaxService } from './../../services/salesTaxService';
import { PurchasableItemPriceInterface } from './../../model/purchasableItemPrice.interface';
import { PriceBookService } from './../../services/priceBookService';
import { PriceBook } from './../../model/priceBook';
import { UserService } from './../../services/userService';
import { Product } from './../../model/product';
import { CategoryIconSelectModal } from './../category-details/modals/category-icon-select/category-icon-select';
import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ViewController, Platform, ModalController, LoadingController } from 'ionic-angular';
import { ProductService } from '../../services/productService';
import { CategoryService } from '../../services/categoryService';
import { icons } from './../../metadata/itemIcons';
import { HelperService } from "../../services/helperService";
import { AppService } from "../../services/appService";
import { StockIncreaseModal } from './modals/stock-increase/stock-increase';
import { StockDecreaseModal } from './modals/stock-decrease/stock-decrease';

interface InteractableStoreStock {
	storeId: string,
	store: Store, /** Store */
	value: number, /** sum of all stock values */
	supplierId?: string, /** from supplier */
	reorderPoint?: any,
	reorderQty?: any
}

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
	public storesStock: InteractableStoreStock[] = [];
	public stockHistory: { [id: string]: StockHistory[] } = {};
	public selectedStore: string;
	public categories = [];
	public brands: any = [];
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

	constructor(public navCtrl: NavController,
		private productService: ProductService,
		private categoryService: CategoryService,
		private storeService: StoreService,
		private stockHistoryService: StockHistoryService,
		private brandService: BrandService,
		private userService: UserService,
		private priceBookService: PriceBookService,
		private salesTaxService: SalesTaxService,
		private helperService: HelperService,
		private appService: AppService,
		private platform: Platform,
		private navParams: NavParams,
		private loading: LoadingController,
		private zone: NgZone,
		private viewCtrl: ViewController,
		private modalCtrl: ModalController,
		private cdr: ChangeDetectorRef) {
		this.icons = icons;
	}

	async ionViewDidLoad() {
		let loader = this.loading.create({
			content: 'Loading Product...',
		});
		this.cdr.detach();
		await loader.present();

		let editProduct = this.navParams.get('item');
		var _user = await this.userService.getUser();
		let stores = await this.storeService.getAll();

		this.selectedStore = stores[0]._id;
		if (editProduct) {
			this.productItem = editProduct;
			this.isNew = false;
			this.action = 'Edit';
			if (this.productItem.hasOwnProperty('icon') && this.productItem.icon) {
				this.selectedIcon = this.productItem.icon.name;
			}
		} else {
			this.productItem.icon = _user.settings.defaultIcon;
			this.selectedIcon = this.productItem.icon.name;
		}

		let promises: Array<Promise<any>> = [
			this.categoryService.getAll(),
			new Promise(async (_resolve, _reject) => {
				this.salesTaxService.get(_user.settings.defaultTax).then((salesTax: any) => {
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
			this.priceBookService.getDefault(),
			this.brandService.getAll(),
		];

		if (!this.isNew) {
			promises.push(this.stockHistoryService.getProductTotalStockValue(this.productItem._id));
			promises.push(new Promise((resolve, reject) => {
				let stockHistories: { [id: string]: StockHistory[] } = {};
				let promises: any[] = [];
				stores.forEach(store => {
					promises.push(async () => {
						stockHistories[store._id] = await this.stockHistoryService.getByStoreAndProductId(
							store._id, this.productItem._id
						);
						return;
					});
				});

				Promise.all(promises.map(promise => promise())).then(() => {
					resolve(stockHistories);
				}).catch(err => reject(err));
			}))
		}

		let results = await Promise.all(promises);

		this.zone.run(() => {
			this.categories = results[0];
			results[1] != null && this.salesTaxes.push(results[1]);
			this.salesTaxes = this.salesTaxes.concat(results[2]);
			this._defaultPriceBook = results[3];
			this.brands = results[4];


			this.storesStock = results[5] ? results[5].map(collectionItem => {
				return <InteractableStoreStock>{
					storeId: collectionItem.storeId,
					store: _.find(stores, { _id: collectionItem.storeId }),
					value: collectionItem.value
				}
			}) : stores.map(store => {
				return <InteractableStoreStock>{
					storeId: store._id,
					store,
					value: 0
				}
			});

			results[6] && (this.stockHistory = _.cloneDeep(results[6]));

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
			} else {
				this.defaultPriceBook = {
					id: this._defaultPriceBook._id,
					isDefault: true,
					tax: productPriceBook.salesTaxId == null ? this.salesTaxes[0] : _.find(this.salesTaxes, { _id: productPriceBook.salesTaxId }),
					item: productPriceBook
				};
			}
			this.cdr.reattach();
			loader.dismiss();

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

	async stockIncrease() {
		let modal = this.modalCtrl.create(StockIncreaseModal, {
			productId: this.productItem._id,
			storesStock: this.storesStock
		});
		modal.onDidDismiss(async (stock: StockHistory) => {
			if (stock) {
				try {
					let model: any = await this.stockHistoryService.add(stock);
					model = await this.stockHistoryService.get(model._id);
					let index = _.findIndex(this.storesStock, { storeId: stock.storeId });
					this.storesStock[index].value += stock.value;
					this.stockHistory[stock.storeId].push(model);
				} catch (err) {

				}
			}
		});
		modal.present();
	}

	async stockDecrease() {
		let modal = this.modalCtrl.create(StockDecreaseModal, {
			productId: this.productItem._id,
			storesStock: this.storesStock
		});
		modal.onDidDismiss(async (stock: StockHistory) => {
			if (stock) {
				try {
					let model: any = await this.stockHistoryService.add(stock);
					model = await this.stockHistoryService.get(model._id);
					let index = _.findIndex(this.storesStock, { storeId: stock.storeId });
					this.storesStock[index].value += stock.value;
					this.stockHistory[stock.storeId].push(model);
				} catch (err) {

				}
			}
		});
		modal.present();
	}

	async saveProducts() {

		if (this.isNew) {
			var res = await this.productService.add(this.productItem);
			this._defaultPriceBook.purchasableItems.push({
				id: res.id,
				retailPrice: Number(this.defaultPriceBook.item.retailPrice),
				inclusivePrice: Number(this.defaultPriceBook.item.inclusivePrice),
				supplyPrice: Number(this.defaultPriceBook.item.supplyPrice),
				markup: Number(this.defaultPriceBook.item.markup),
				salesTaxId: this.defaultPriceBook.tax.hasOwnProperty('isDefault') && this.defaultPriceBook.tax.isDefault ? null : this.defaultPriceBook.tax._id,
				saleTaxEntity: this.defaultPriceBook.tax.entityTypeName
			});
			await this.priceBookService.update(this._defaultPriceBook);
		} else {
			await this.productService.update(this.productItem);
			let index = _.findIndex(this._defaultPriceBook.purchasableItems, { id: this.productItem._id });
			let dBuffer = {
				id: this.productItem._id,
				retailPrice: Number(this.defaultPriceBook.item.retailPrice),
				inclusivePrice: Number(this.defaultPriceBook.item.inclusivePrice),
				supplyPrice: Number(this.defaultPriceBook.item.supplyPrice),
				markup: Number(this.defaultPriceBook.item.markup),
				salesTaxId: this.defaultPriceBook.tax.hasOwnProperty('isDefault') && this.defaultPriceBook.tax.isDefault ? null : this.defaultPriceBook.tax._id,
				saleTaxEntity: this.defaultPriceBook.tax.entityTypeName
			};

			index > -1 ? this._defaultPriceBook.purchasableItems[index] = dBuffer :
				this._defaultPriceBook.purchasableItems.push(dBuffer);

			await this.priceBookService.update(this._defaultPriceBook);
		}
		this.navCtrl.pop();
	}

}
