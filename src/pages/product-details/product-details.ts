import { Supplier } from './../../model/supplier';
import { Store } from './../../model/store';
import { StockHistoryService } from './../../services/stockHistoryService';
import {Reason, StockHistory} from './../../model/stockHistory';
import { StoreService } from './../../services/storeService';
import { BrandService } from './../../services/brandService';
import _ from 'lodash';
import { SalesTaxService } from './../../services/salesTaxService';
import { PurchasableItemPriceInterface } from './../../model/purchasableItemPrice.interface';
import { PriceBookService } from './../../services/priceBookService';
import { PriceBook } from './../../model/priceBook';
import { Product } from './../../model/product';
import { CategoryIconSelectModal } from './../category-details/modals/category-icon-select/category-icon-select';
import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import {NavController, NavParams, ModalController, LoadingController, AlertController} from 'ionic-angular';
import { ProductService } from '../../services/productService';
import { CategoryService } from '../../services/categoryService';
import { icons } from '@simpleidea/simplepos-core/dist/metadata/itemIcons';
import { AppService } from "../../services/appService";
import { StockIncreaseModal } from './modals/stock-increase/stock-increase';
import { StockDecreaseModal } from './modals/stock-decrease/stock-decrease';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { SupplierService } from '../../services/supplierService';
import { UserService } from '../../modules/dataSync/services/userService';
import { Subject } from "rxjs/Subject";
import { Utilities } from "../../utility";
import * as moment from "moment-timezone";
import {EmployeeService} from "../../services/employeeService";
import {SyncContext} from "../../services/SyncContext";

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

@SecurityModule(SecurityAccessRightRepo.ProductAddEdit)
@Component({
	templateUrl: 'product-details.html'
})
export class ProductDetails {
	public productItem: Product = new Product();
	public priceBooks: Array<InteractableItemPriceInterface> = [];
	public salesTaxes: Array<any> = [];
	public storesStock: InteractableStoreStock[] = [];
	public stockHistory: { [id: string]: StockHistory[] } = {};
	public suppliers: Supplier[] = [];
	public selectedStore: string;
	public categories = [];
	public brands: any = [];
	public isNew = true;
	public action = 'Edit';
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
	private stockEntities: StockHistory[] = [];
	private color: Subject<string> = new Subject<string>();
	private image: Subject<string> = new Subject<string>();
	private thumbnail: Subject<string> = new Subject<string>();
	public isStockEnabled: boolean = false;

	constructor(public navCtrl: NavController,
		private productService: ProductService,
		private categoryService: CategoryService,
		private storeService: StoreService,
		private stockHistoryService: StockHistoryService,
		private supplierService: SupplierService,
		private brandService: BrandService,
		private userService: UserService,
		private priceBookService: PriceBookService,
		private salesTaxService: SalesTaxService,
		private appService: AppService,
		private navParams: NavParams,
		private loading: LoadingController,
		private zone: NgZone,
		private modalCtrl: ModalController,
		private alertCtrl: AlertController,
		private cdr: ChangeDetectorRef,
		private employeeService: EmployeeService,
		private utility: Utilities,
		private syncContext: SyncContext) {
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
			if (this.productItem.hasOwnProperty('icon') && this.productItem.icon) {
				this.selectedIcon = this.productItem.icon.name;
			}
		} else {
			this.productItem.icon = _user.settings.defaultIcon;
			this.selectedIcon = this.productItem.icon.name;
		}

		this.isStockEnabled = this.productItem.stockControl || false;
		this.color.asObservable().subscribe(color => {
			this.productItem.color = color;
		});
		this.color.next(this.productItem.color);

		this.image.asObservable().subscribe(image => {
			this.productItem.image = image;
		});
		this.thumbnail.asObservable().subscribe(thumbnail => {
			this.productItem.thumbnail = thumbnail;
		});
		this.image.next(this.productItem.image);
		this.thumbnail.next(this.productItem.thumbnail);

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
			this.supplierService.getAll()
		];

		if (!this.isNew) {
			promises.push(new Promise((resolve, reject) => {
				this.stockHistoryService.getProductTotalStockValue(this.productItem._id).then((collection: any[]) => {
					let storesStock: InteractableStoreStock[] = stores.map(store => {
						let obj: InteractableStoreStock = {
							storeId: store._id,
							store,
							value: 0
						};
						let item: any = _.find(collection, { storeId: store._id });
						item && (obj.value = item.value);
						return obj;
					});

					resolve(storesStock);
				});
			}));
		} else {
			promises.push(new Promise((resolve, reject) => {
				let storesStock: InteractableStoreStock[] = stores.map(store => {
					return <InteractableStoreStock>{
						storeId: store._id,
						store,
						value: 0
					}
				});
				resolve(storesStock);
			}));
			promises.push(new Promise((resolve, reject) => {
				let stockHistories: { [id: string]: StockHistory[] } = {};
				stores.forEach(store => {
					stockHistories[store._id] = [];
				});
				resolve(stockHistories);
			}));
		}

		let [
			categories,
			defaultTax,
			salesTaxes,
			defaultPB,
			brands,
			suppliers,
			storesStock
		] = await Promise.all(promises);

		this.zone.run(() => {
			this.categories = categories;
			defaultTax != null && this.salesTaxes.push(defaultTax);
			this.salesTaxes = this.salesTaxes.concat(salesTaxes);
			this._defaultPriceBook = defaultPB;
			this.brands = brands;
			this.suppliers = suppliers;
			this.storesStock = storesStock;

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
			loader.dismiss();
			this.getAllStoreStockHistory();
		});
	}

	private async getAllStoreStockHistory() {
		try {
			const allStocks = await this.stockHistoryService.getByProductId(
				this.productItem._id
			);
			this.stockHistory = allStocks.reduce((obj, data) => {
				!obj[data.storeId] && (obj[data.storeId] = []);
				obj[data.storeId].push(data);
				return obj;
			}, {});
		} catch (ex) {

		} finally {
			this.cdr.reattach();
		}
	}
	public selectIcon() {
		let modal = this.modalCtrl.create(CategoryIconSelectModal, { selectedIcon: this.selectedIcon });
		modal.onDidDismiss(data => {
			if (data && data.status) {
                this.productItem.icon = this.icons[data.selected] || null;
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

	stockUpdate(): { increase: Function, decrease: Function } {
		let params = {
			productId: this.productItem._id,
			storesStock: this.storesStock
		};
		let onDismiss = (stock: StockHistory) => {
			if (stock) {
				try {
					this.stockEntities.push(stock);
					let index = _.findIndex(this.storesStock, { storeId: stock.storeId });
					this.storesStock[index].value += stock.value;
                    !this.stockHistory[stock.storeId] && ( this.stockHistory[stock.storeId] = [] );
					this.stockHistory[stock.storeId].push(stock);
				} catch (err) {
					throw new Error(err);
				}
			}
		}

		return {
			increase: () => {
				let modal = this.modalCtrl.create(StockIncreaseModal, params);
				modal.onDidDismiss(onDismiss);
				modal.present();
			},
			decrease: () => {
				let modal = this.modalCtrl.create(StockDecreaseModal, params);
				modal.onDidDismiss(onDismiss);
				modal.present();
			}
		};
	}

	public onStockToggle(event){
		let alert;
		if(!this.isStockEnabled){
            alert = this.alertCtrl.create({
                title: 'You cannot turn off the stock',
                buttons: [
                    {
                        text: 'OK',
                        role: 'cancel',
                        handler: data => {
                            this.isStockEnabled = true
                        }
                    }
                 ]
            });
		}else{
			alert = this.alertCtrl.create({
				title: 'Initial Value',
				inputs: [
					{
						name: 'initialVal',
						placeholder: 'Initial Value'
					}
				],
				buttons: [
					{
						text: 'Cancel',
						role: 'cancel',
						handler: data => {
							this.isStockEnabled = false
						}
					},
					{
						text: 'Save',
						handler: data => {
							if(data.initialVal){
								this.isStockEnabled = true;
								this.addInitialVal(data.initialVal);
							}else{
								this.isStockEnabled = false
							}
						}
					}
				]
			});
        }
        alert.present();
	}

	public async addInitialVal(initVal){
		initVal = Number(initVal);
		if(initVal && initVal > 0) {
            const stock: StockHistory = new StockHistory();
            stock.productId = this.productItem._id;
            stock.reason = Reason.InitialValue;
            stock.storeId = this.syncContext.currentStore._id;
            stock.createdAt = moment().utc().format();
            stock.value = initVal;
            stock.createdBy = this.employeeService.getEmployee()._id;
            stock.supplyPrice = stock.supplyPrice ? Number(stock.supplyPrice) : null;
            this.stockEntities.push(stock);
            let index = _.findIndex(this.storesStock, { storeId: stock.storeId });
            this.storesStock[index].value += stock.value;
        }
	}

	public async saveProducts() {
		this.productItem.stockControl = this.isStockEnabled;
		if (this.isNew) {
			var res = await this.productService.add(this.productItem);
			this._defaultPriceBook.purchasableItems.push({
				id: res._id,
				retailPrice: Number(this.defaultPriceBook.item.retailPrice),
				inclusivePrice: Number(this.defaultPriceBook.item.inclusivePrice),
				supplyPrice: Number(this.defaultPriceBook.item.supplyPrice),
				markup: Number(this.defaultPriceBook.item.markup),
				salesTaxId: this.defaultPriceBook.tax.hasOwnProperty('isDefault') && this.defaultPriceBook.tax.isDefault ? null : this.defaultPriceBook.tax._id,
				saleTaxEntity: this.defaultPriceBook.tax.entityTypeName
			});
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

		// finalize stock updates
		await this.priceBookService.update(this._defaultPriceBook);
		if (this.stockEntities.length > 0) {
			let stockPromises: Promise<any>[] = this.stockEntities.map(stockHistory => {
				return this.stockHistoryService.add(stockHistory);
			});

			await Promise.all(stockPromises);
		}
		this.navCtrl.pop();
	}

	public async delete() {
		// delete associations
		const deleteItem = await this.utility.confirmRemoveItem("Do you really want to delete this product!");
		if (!deleteItem) {
			return;
		}
		let deleteAssocs: any[] = [
			async () => {
				// delete pricebook entries
				let pbIndex = _.findIndex(this._defaultPriceBook.purchasableItems, { id: this.productItem._id });
				if (pbIndex > -1) {
					this._defaultPriceBook.purchasableItems.splice(pbIndex, 1);
					return await this.priceBookService.update(this._defaultPriceBook);
				}
			}
		];

		await Promise.all(deleteAssocs);
		await this.productService.delete(this.productItem);
		this.navCtrl.pop();
		return;
	}
}