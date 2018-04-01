import _ from 'lodash';
import { SalesServices } from './../../services/salesService';
import { Device } from './../../model/store';
import { Component, NgZone } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { SyncContext } from "../../services/SyncContext";
import { Sale } from "../../model/sale";
import { DBService } from "@simpleidea/simplepos-core/dist/services/dBService";
import { SortOptions } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { DBDataEvent } from "@simpleidea/simplepos-core/dist/db/dbDataEvent";

@Component({
    selector: 'bump-details',
    templateUrl: 'bump-details.html',
    styleUrls: ['/pages/bump-details/bump-details.scss']
})
export class BumpDetails {
    public sales = [];
    public showPrevious: boolean = false;
    public showNext: boolean = false;
    private limit: number = 12;
    private skip: number = 0;
    private device;
    private isBumpedViewSelected: boolean = false;

    constructor(public navCtrl: NavController,
        private salesService: SalesServices,
        private navParams: NavParams,
        private ngZone: NgZone,
        private syncContext: SyncContext) {
    }

    async ionViewDidLoad() {
        this.device = <Device>this.navParams.get('device');
        await this.showSales();
        this.initDBChange()
    }

    public async showSales(type?: string) {
        switch (type) {
            case "next":
                this.skip += this.limit;
                this.skip > 0 && (this.showPrevious = true);
                break;
            case "prev":
                this.skip -= this.limit;
                this.skip === 0 && (this.showPrevious = false);
                break;
        }
        const currentDate = new Date();
        const timeFrame = { startDate: this.syncContext.currentPos.openTime, endDate: null };
        const options = { state: 'completed', isBumped: false };
        if (this.isBumpedViewSelected) {
            options['isBumped'] = true;
        }
        this.sales = await this.salesService.searchSales(this.device.posIds, this.limit + 1, this.skip, options,
            timeFrame, null, null, SortOptions.ASC);

        if (this.sales.length > this.limit) {
            this.showNext = true;
            this.sales.splice(this.limit);
        } else {
            this.showNext = false;
        }

        this.sales = this.sales.filter(sale => {

            if (this.device.associatedPurchasableItemIds && this.device.associatedPurchasableItemIds.length > 0) {
                sale.items = sale.items.filter(item => {
                    return (this.device.associatedPurchasableItemIds as any).includes(item.purchsableItemId)
                });
            }

            if (sale.items.length) {
                sale.elapsedTime = Math.round((<any>currentDate - <any>new Date(sale.completedAt)) / (1000 * 60));
                return sale;
            }
        });
    }


    private initDBChange() {
        DBService.currentDBLiveProgress.subscribe((data: DBDataEvent) => {
            if (data.isValid && data.entityTypeName == "Sale" && data.data.state == "completed" && this.sales.length < this.limit) {
                let newSale = data.data;
                let sale = _.find(this.sales, { receiptNo: data.data.receiptNo });

                if (!sale) {

                    if (this.device.associatedPurchasableItemIds && this.device.associatedPurchasableItemIds.length > 0) {
                        newSale.items = newSale.items.filter(item => {
                            return (this.device.associatedPurchasableItemIds as any).includes(item.purchsableItemId)
                        });
                    }

                    if (this.device.posIds && this.device.posIds.length > 0 && !this.device.posIds.includes(newSale.posID)) {
                        newSale = null;
                    }

                    if (newSale && newSale.items.length) {
                        if ((this.isBumpedViewSelected && !newSale.isBumped) || (!this.isBumpedViewSelected && newSale.isBumped)) {
                            return;
                        }
                        newSale.elapsedTime = Math.round((<any>new Date() - <any>new Date(newSale.completedAt)) / (1000 * 60));
                        this.ngZone.run(() => {
                            this.sales.push(newSale);

                            if (this.sales.length > this.limit) {
                                this.showNext = true;
                            } else {
                                this.showNext = false;
                            }

                        });
                    }
                }
            }
        });
    }

    public showView(type: string = "PENDING") {
        this.isBumpedViewSelected = false;
        if (type === "BUMPED") {
            this.isBumpedViewSelected = true;
        }
        this.skip = 0;
        this.showNext = false;
        this.showPrevious = false;
        this.showSales();
    }

    public async bump(sale, index) {
        sale.items.forEach(item => {
            item.isBumped = true;
        });
        sale.isBumped = true;
        await this.salesService.update(sale);
        this.sales.splice(index, 1);

        if (this.sales.length > this.limit) {
            this.showNext = true;
        } else {
            this.showNext = false;
        }

    }

    public async bumpItem(sale: Sale) {
        await this.salesService.update(sale);
    }

}