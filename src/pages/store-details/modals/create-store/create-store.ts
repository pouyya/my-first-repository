import * as moment from 'moment-timezone';
import _ from 'lodash';
import { LoadingController, ViewController } from 'ionic-angular';
import { Component } from "@angular/core";
import { StoreService } from "../../../../services/storeService";
import { UserService } from "../../../../modules/dataSync/services/userService";
import { PriceBook } from "../../../../model/priceBook";
import { Store, POS, Device } from '../../../../model/store';


@Component({
    selector: 'create-store-modal',
    templateUrl: 'create-store.html'
})

export class CreateStoreModal {

    public storeItem: Store = new Store();
    private _defaultPriceBook: PriceBook;
    public salesTaxes: Array<any> = [];
    public timezones: Array<{ code: string; name: string }> = [];
    public pos: POS;
    public device: Device;
    public ipAddress: string;
    public printerPort: string;
    public timezone: { code: string; name: string };

    patternIpAddress = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    patternPrinterPort = "([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])";

    constructor(
        private viewCtrl: ViewController,
        private loading: LoadingController,
        private storeService: StoreService,
        private userService: UserService,
    ) {
        this.pos = new POS();
    }

    async ionViewDidLoad() {
        let loader = this.loading.create({
            content: 'Loading store...',
        });
        await loader.present();
        var _user = await this.userService.getUser();

        this.timezones = moment.tz.names().map((timezone) => {
            return <{ code: string; name: string }>{
                code: timezone,
                name: timezone
            };
        });

        loader.dismiss();
    }

    public async createStore() {
        this.pos.id = moment().utc().format('YYYY-MM-DDTHH:mm:ss.SSSSSSS');
        var store = await this.storeService.add(this.storeItem);
        await this.storeService.addFirstStore(this.pos, store, this.ipAddress, Number(this.printerPort), this.timezone);
        this.viewCtrl.dismiss({ status: true, store });
    }

    public dismiss() {
        this.viewCtrl.dismiss();
    }

}