import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { LoadingController, NavController, NavParams, Platform, ToastController } from 'ionic-angular';
import { StoreService } from "../../services/storeService";
import { Store } from './../../model/store';
import { PosDetailsPage } from './../pos-details/pos-details';
import { POS } from './../../model/pos';
import { PosService } from './../../services/posService';
import { SalesTax } from './../../model/salesTax';
import { SalesTaxService } from './../../services/salesTaxService';

@Component({
	templateUrl: 'store-details.html',
})
export class StoreDetailsPage {
	public item: Store = new Store();
	public isNew: boolean = true;
	public action: string = 'Add';
	public registers: Array<POS> = [];
	public countries: Array<any> = [];
	public salesTaxes: Array<SalesTax> = [];

	constructor(
		private navCtrl: NavController,
		private navParams: NavParams,
		private platform: Platform,
		private storeService: StoreService,
		private salesTaxService: SalesTaxService,
		private posService: PosService,
		private loading: LoadingController,
		private toastCtrl: ToastController,
		private http: Http) {
	}

	ionViewDidEnter() {
		let loader = this.loading.create({
			content: 'Loading Store...'
		});

		loader.present().then(() => {
			let promises: Array<Promise<any>> = [
				// load store data
				new Promise((resolve, reject) => {
					let store = this.navParams.get('store');
					if (store) {
						this.item = store;
						this.isNew = false;
						this.action = 'Edit';

						// load registers/POS
						this.posService.findBy({ selector: { storeId: this.item._id } }).then((registers) => {
							if (registers && registers.length) {
								this.registers = registers;
							}
							resolve();
						}).catch((error) => {
							reject(new Error(error));
						});
					} else {
						resolve();
					}
				}),
				// load countries list
				new Promise((resolve, reject) => {
					this.http.get('assets/countries.json')
						.subscribe(res => {
							this.countries = res.json();
							resolve();
						});
				}),
				// load sales tax
				new Promise((resolve, reject) => {
					this.salesTaxService.getUserSalesTax().then((taxes: Array<SalesTax>) => {
						this.salesTaxes = taxes;
						resolve();
					}).catch((error) => {
						resolve(error);
					});
				})
			];

			Promise.all(promises).then(function () {
				loader.dismiss();
			});

		});
	}

	onSubmit() {
		console.log(this.item);
		if (this.isNew) {
			this.storeService.add(this.item)
				.catch(console.error.bind(console));
		} else {
			this.storeService.update(this.item)
				.catch(console.error.bind(console));
		}
		this.navCtrl.pop();
	}

	public showPos(pos: POS) {
		this.navCtrl.push(PosDetailsPage, {
			pos: pos,
			storeId: this.item._id
		});
	}

	public addRegister() {
		this.navCtrl.push(PosDetailsPage, {
			pos: null,
			storeId: this.item._id
		});
	}

	public remove() {
		this.storeService.delete(this.item).then(() => {
			let toast = this.toastCtrl.create({
				message: 'Store has been deleted successfully',
				duration: 3000
			});
			toast.present();
			this.navCtrl.pop();
		})
	}
}
