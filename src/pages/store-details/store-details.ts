import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { StoreService } from "../../services/storeService";

@Component({
	templateUrl: 'store-details.html',
})
export class StoreDetailsPage {
	public item: any = {};
	public isNew = true;
	public action = 'Add';

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		private platform: Platform,
		private storeService: StoreService) {
	}

	ionViewDidLoad() {
		let currentItem = this.navParams.get('store');
		if (currentItem) {
			this.item = currentItem;
			this.isNew = false;
			this.action = 'Edit';
		}
	}

	save() {
		if (this.isNew) {
			this.storeService.add(this.item)
				.catch(console.error.bind(console));
		} else {
			this.storeService.update(this.item)
				.catch(console.error.bind(console));
		}
		this.navCtrl.pop();
	}

	onSubmit() {
		console.log(this.item)
	}
}
