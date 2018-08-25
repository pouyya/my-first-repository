import * as moment from 'moment-timezone';
import _ from 'lodash';
import { LoadingController, ViewController } from 'ionic-angular';
import { Component } from "@angular/core";
import { StoreService } from "../../../../services/storeService";
import { UserService } from "../../../../modules/dataSync/services/userService";
import { PriceBook } from "../../../../model/priceBook";
import { Store } from '../../../../model/store';


@Component({
    selector: 'create-store-modal',
    templateUrl: 'create-store.html'
})

export class CreateStoreModal {

    public storeItem: Store = new Store();
    private _defaultPriceBook: PriceBook;
    public salesTaxes: Array<any> = [];
    constructor(
        private viewCtrl: ViewController,
        private loading: LoadingController,
        private storeService: StoreService,
        private userService: UserService,
    ) {
    }

    async ionViewDidLoad() {
        let loader = this.loading.create({
            content: 'Loading store...',
        });
        await loader.present();
        var _user = await this.userService.getUser();
        loader.dismiss();
    }

    public async createStore() {
        var store = await this.storeService.add(this.storeItem);

        this.viewCtrl.dismiss({ status: true, store });
    }

    public dismiss() {
        this.viewCtrl.dismiss();
    }

}