import { Component, ViewChild } from '@angular/core';
import { ReportModule } from '../../modules/reportModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { Subject } from 'rxjs/Subject';
import { Chart } from 'chart.js';
import { LoadingController } from 'ionic-angular';
import { SyncContext } from '../../services/SyncContext';
import * as moment from 'moment-timezone';
import { AccountSettingService } from '../../modules/dataSync/services/accountSettingService';
import { DateTimeService } from '../../services/dateTimeService';
import { HelperService } from '../../services/helperService';
import { SalesSummaryReportService } from '../../services/salesSummaryReportService';
import { SalesSummaryList, SalesList, Convert } from '../../model/SalesReportResponse';

@SecurityModule(SecurityAccessRightRepo.ReportsDashboard)
@PageModule(() => ReportModule)
@Component({
	selector: 'report-dashboard',
	templateUrl: 'report-dashboard.html',
	styleUrls: [ '/components/pages/report-dashboard.scss' ]
})
export class ReportsDashboard {
	@ViewChild('lineCanvas') lineCanvas;
	@ViewChild('progressBar') progressBar;
	private lineChart;
	private dates$: Subject<Object> = new Subject<Object>();
	private fromDate: Date;
	private toDate: Date;
	private sales;
	private totalNoSales: number = 0;
	private totalSales: number = 0;
	private totalSaleAverage: number = 0;
	private isTaxInclusive: boolean = false;
	public selectedValue: string = 'WEEK';
	public selectedStore;
	public locations = [ { text: 'All locations', value: '' } ];
	public salesSummaryList: SalesSummaryList;
	public salesList: SalesList[];
	public chartDatePattern: string = 'DD MMM YYYY';

	constructor(
		private syncContext: SyncContext,
		private dateTimeService: DateTimeService,
		private accountSettingService: AccountSettingService,
		private loading: LoadingController,
		private helperService: HelperService,
		private salesSummaryReportService: SalesSummaryReportService
	) {}

	async ionViewDidLoad() {
		this.locations.unshift({ text: 'Current', value: this.syncContext.currentStore._id });
		this.selectedStore = this.locations[0].value;
		let loader = this.loading.create({ content: 'Loading Report...' });
		await loader.present();

		this.dates$.asObservable().subscribe(async (date: any) => {
			this.fromDate = this.dateTimeService.getTimezoneDate(date.fromDate).toDate();
			this.toDate = this.dateTimeService.getTimezoneDate(date.toDate).toDate();
			await this.loadSales();
		});

		let fromDate = this.dateTimeService.getTimezoneDate(new Date()).toDate(),
			toDate = this.dateTimeService.getTimezoneDate(new Date()).toDate();
		fromDate.setHours(0);
		fromDate.setMinutes(0);
		fromDate.setSeconds(0);
		fromDate.setDate(fromDate.getDate() - 7);
		this.dates$.next({ fromDate, toDate });

		var currentAccount = await this.accountSettingService.getCurrentSetting();
		this.isTaxInclusive = currentAccount.taxType;
		loader.dismiss();
	}

	private async loadSales() {
		try {
			let currentPosId = ''; //means all location
			let posIDs: string[] = this.selectedStore ? [ this.syncContext.currentPos.id ] : [];
			if (posIDs && posIDs.length == 1) {
				currentPosId = this.syncContext.currentPos.id;
			}
			let loading = this.loading.create({ content: 'Loading Report...' });
			await loading.present();
			var sales = await this.salesSummaryReportService.getDashboard(currentPosId, this.fromDate, this.toDate);
			sales.subscribe(
				(json) => {
					this.salesSummaryList = <SalesSummaryList>Convert.toReportResult(json);
					this.salesList = <SalesList[]>this.salesSummaryList.salesList;
					this.totalNoSales = this.salesSummaryList.salesCountTotal;
					this.totalSaleAverage = this.salesSummaryList.salesAverage;
					this.totalSales = this.salesSummaryList.totalExcTax;

					this.sales = Object.keys(this.salesList).sort().map((key) => {
						this.salesList[key].saleAverage = this.helperService.round2Dec(
							this.salesList[key].total / this.salesList[key].noOfSales
						);
						this.salesList[key].total = this.helperService.round2Dec(this.salesList[key].total);
						this.salesList[key].taxAmount = this.helperService.round2Dec(this.salesList[key].taxAmount);
						this.salesList[key].netAmount = this.helperService.round2Dec(this.salesList[key].netAmount);
						return this.salesList[key];
					});
					this.loadPurchaseChart();
				},
				(err) => {
					console.log(err);
					loading.dismiss();
				},
				() => loading.dismiss()
			);
		} catch (ex) {}
	}

	private loadPurchaseChart() {
		const labels = [],
			data = [];
		this.sales.map((sale) => {
			labels.push(this.dateTimeService.getTimezoneDate(sale.date).format(this.chartDatePattern));
			data.push(sale.total.toFixed(2));
		});
		this.lineChart = new Chart(this.lineCanvas.nativeElement, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Total Sales Amount',
						fill: false,
						lineTension: 0.1,
						backgroundColor: 'rgba(75,192,192,0.4)',
						borderColor: 'rgba(75,192,192,1)',
						borderCapStyle: 'butt',
						borderDash: [],
						borderDashOffset: 0.0,
						borderJoinStyle: 'miter',
						pointBorderColor: 'rgba(75,192,192,1)',
						pointBackgroundColor: '#fff',
						pointBorderWidth: 1,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: 'rgba(75,192,192,1)',
						pointHoverBorderColor: 'rgba(220,220,220,1)',
						pointHoverBorderWidth: 2,
						pointRadius: 5,
						pointHitRadius: 10,
						data,
						spanGaps: false
					}
				]
			},
			options: {
				maintainAspectRatio: false
			}
		});
	}
}
