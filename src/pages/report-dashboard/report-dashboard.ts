import { Component, ViewChild } from '@angular/core';
import { ReportModule } from '../../modules/reportModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { Subject } from "rxjs/Subject";
import { Chart } from 'chart.js'
import { LoadingController } from "ionic-angular";
import { SalesServices } from "../../services/salesService";
import { SyncContext } from "../../services/SyncContext";
import * as moment from "moment-timezone";
import { AccountSettingService } from "../../modules/dataSync/services/accountSettingService";

@SecurityModule(SecurityAccessRightRepo.ReportsDashboard)
@PageModule(() => ReportModule)
@Component({
  selector: 'report-dashboard',
  templateUrl: 'report-dashboard.html',
  styleUrls: ['/components/pages/report-dashboard.scss']
})
export class ReportsDashboard {

    @ViewChild('lineCanvas') lineCanvas;
    private lineChart;
    private dates$: Subject<Object> = new Subject<Object>();
    private fromDate: Date;
    private toDate: Date;
    private sales;
    private totalSales: number = 0;
    private salesAverage: number = 0;
    private isTaxInclusive: boolean = false;

    constructor(private salesService: SalesServices,
                private syncContext: SyncContext,
                private accountSettingService: AccountSettingService,
                private loading: LoadingController) {
    }

    async ionViewDidLoad() {
      this.dates$.asObservable().subscribe(async (date: any) => {
         this.fromDate = date.fromDate;
         this.toDate = date.toDate;
         let loader = this.loading.create({ content: 'Loading Report...', });
         await loader.present();
         await this.loadSales();
         this.loadPurchaseChart();
         loader.dismiss();
      });

        let fromDate = new Date(), toDate = new Date();
        fromDate.setHours(0);
        fromDate.setMinutes(0);
        fromDate.setSeconds(0);
        this.dates$.next({fromDate, toDate});

        var currentAccount = await this.accountSettingService.getCurrentSetting();
        this.isTaxInclusive = currentAccount.taxType;
    }

    private async loadSales(){
        try {
            this.totalSales = 0;
            this.salesAverage = 0;
            const sales = await this.salesService.searchSales(
                [this.syncContext.currentPos.id],
                null,
                null,
                null,
                {startDate: moment.utc(this.fromDate).format(), endDate: moment.utc(this.toDate).format()},
                null,
                null
            );

            const salesObj = sales.reduce((obj, sale)=> {
                const created = moment(sale.created).format("MMM D YYYY");
                if(!obj[created]){
                    obj[created] = {noOfSales: 0, netAmount: 0, taxAmount: 0, total: 0, saleAverage: 0};
                }
                obj[created].date = created;
                obj[created].noOfSales += 1;
                obj[created].netAmount += Math.round(sale.subTotal);
                obj[created].taxAmount += Math.round(sale.tax);
                obj[created].total += Math.round(this.isTaxInclusive && sale.taxTotal || sale.subTotal);
                obj[created].saleAverage += Math.round(obj[created].total / obj[created].noOfSales);
                return obj;
            }, {});

            this.sales = Object.keys(salesObj).sort().map(key => {
                console.log('In');
                this.totalSales += salesObj[key].noOfSales;
                this.salesAverage += salesObj[key].saleAverage;
                return salesObj[key]
            });
        } catch(ex){

        }
    }
    private loadPurchaseChart(){
        const labels = [], data = [];
        this.sales.map(sale => {
            labels.push(sale.date);
            data.push(sale.total);
        })
        this.lineChart = new Chart(this.lineCanvas.nativeElement, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: "Total Sales Amount",
                        fill: false,
                        lineTension: 0.1,
                        backgroundColor: "rgba(75,192,192,0.4)",
                        borderColor: "rgba(75,192,192,1)",
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: "rgba(75,192,192,1)",
                        pointBackgroundColor: "#fff",
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgba(75,192,192,1)",
                        pointHoverBorderColor: "rgba(220,220,220,1)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 5,
                        pointHitRadius: 10,
                        data,
                        spanGaps: false,
                    }
                ]
            },
            options: {
                maintainAspectRatio: false
            }

        });
    }
}
