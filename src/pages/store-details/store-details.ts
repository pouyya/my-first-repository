import { PosDetailsPage } from './../pos-details/pos-details';
import { POS } from './../../model/pos';
import { PosService } from './../../services/posService';
import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { StoreService } from "../../services/storeService";
import { Store } from './../../model/store';

@Component({
	templateUrl: 'store-details.html',
})
export class StoreDetailsPage {
	public item: Store = new Store();
	public isNew: boolean = true;
	public action: string = 'Add';
	public registers: Array<POS> = [];
	public countries: Array<any> = [];

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		private platform: Platform,
		private storeService: StoreService,
		private posService: PosService,
		private http: Http) {
	}

	ionViewDidEnter() {
		let store = this.navParams.get('store');
		if (store) {
			this.item = store;
			this.isNew = false;
			this.action = 'Edit';

			// load registers/POS
			this.posService.findBy({ selector: { storeId: this.item._id } }).then((registers) => {
				if(registers && registers.length) {
					this.registers = registers;
				}
			}).catch((error) => {
				throw new Error(error);
			});
		}

		this.http.get('assets/countries.json')
		.subscribe(res => this.countries = res.json());
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
		this.navCtrl.push(PosDetailsPage, { pos: pos });
	}

	public removePos(pos, index) {

	}

	public addRegister() {
		this.navCtrl.push(PosDetailsPage, { pos: null });
	}

	public remove() {
		// this.posService.delete({ selector: { storeId: this.item._id } })
	}
}
