import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ReportModule } from '../../modules/reportModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { Subject } from 'rxjs/Subject';
import { Chart } from 'chart.js';
import { LoadingController, ToastController } from 'ionic-angular';
import { SyncContext } from '../../services/SyncContext';
import { AccountSettingService } from '../../modules/dataSync/services/accountSettingService';
import { DateTimeService } from '../../services/dateTimeService';
import { HelperService } from '../../services/helperService';
import { SalesSummaryReportService } from '../../services/salesSummaryReportService';
import { SalesSummaryList, SalesSummary } from '../../model/SalesReportResponse';
import { NetworkService } from '../../services/networkService';

@SecurityModule(SecurityAccessRightRepo.ReportsDashboard)
@PageModule(() => ReportModule)
@Component({
	selector: 'report-dashboard',
	templateUrl: 'report-dashboard.html',
	styleUrls: ['/components/pages/report-dashboard.scss']
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
	public selectedValue: string;
	public selectedStore;
	public locations = [{ text: 'All locations', value: '' }];
	public salesSummaryList: SalesSummaryList;
	public salesSummary: SalesSummary[];
	networkStatus: boolean;

	constructor(
		private syncContext: SyncContext,
		private dateTimeService: DateTimeService,
		private accountSettingService: AccountSettingService,
		private loading: LoadingController,
		private helperService: HelperService,
		private salesSummaryReportService: SalesSummaryReportService,
		private networkService: NetworkService,
		private cdRef: ChangeDetectorRef,
		private toastCtrl: ToastController
	) { }

	async ionViewDidLoad() {
		this.networkService.statusConfirmed$.subscribe(
			status => {
				this.networkStatus = status;
			});

		this.networkService.announceStatus(true);
		this.locations.unshift({ text: 'Current', value: this.syncContext.currentStore._id });
		this.selectedStore = this.locations[0].value;
		let loader = this.loading.create({ content: 'Loading Report...' });
		await loader.present();

		this.dates$.asObservable().subscribe(async (date: any) => {
			this.fromDate = date.fromDate;
			this.toDate = date.toDate;
			await this.loadSales();
		});

		let fromDate = new Date(), toDate = new Date();
		fromDate.setHours(0, 0, 0, 0);
		fromDate.setDate(fromDate.getDate() - 7);
		this.dates$.next({ fromDate, toDate });

		var currentAccount = await this.accountSettingService.getCurrentSetting();
		this.isTaxInclusive = currentAccount.taxType;
		loader.dismiss();
	}

	ngAfterViewChecked() {
		this.selectedValue = 'WEEK';
		this.cdRef.detectChanges();
	}

	private async loadSales() {
		try {
			let currentPosId = ''; //means all location
			let posIDs: string[] = this.selectedStore ? [this.syncContext.currentPos.id] : [];
			if (posIDs && posIDs.length == 1) {
				currentPosId = this.syncContext.currentPos.id;
			}

			let loading = this.loading.create({ content: 'Loading Report...' });

			await loading.present();

			this.fromDate.setHours(0, 0, 0, 0);
			this.toDate.setHours(23, 59, 59, 0);

			var sales = await this.salesSummaryReportService.getSalesSummary(
				currentPosId,
				this.dateTimeService.getLocalISOString(this.fromDate),
				this.dateTimeService.getLocalISOString(this.toDate)
			);

			sales.subscribe(
				salesSummaryList => {
					this.salesSummaryList = salesSummaryList;
					this.salesSummary = <SalesSummary[]>this.salesSummaryList.salesSummary;
					this.totalNoSales = this.salesSummaryList.salesCountTotal;
					this.totalSaleAverage = this.helperService.round2Dec(this.salesSummaryList.salesAverage);
					this.totalSales = this.helperService.round2Dec(this.salesSummaryList.totalExcTax);

					this.sales = Object.keys(this.salesSummary).sort().map((key) => {
						this.salesSummary[key].saleAverage = this.helperService.round2Dec(
							this.salesSummary[key].total / this.salesSummary[key].noOfSales
						);
						this.salesSummary[key].total = this.helperService.round2Dec(this.salesSummary[key].total);
						this.salesSummary[key].taxAmount = this.helperService.round2Dec(this.salesSummary[key].taxAmount);
						this.salesSummary[key].netAmount = this.helperService.round2Dec(this.salesSummary[key].netAmount);
						return this.salesSummary[key];
					});
					this.loadPurchaseChart();
				},
				err => {
					let toast = this.toastCtrl.create({ message: 'Server not availble now!', duration: 3000 })
					toast.present();
					console.log(err);
					loading.dismiss();
				},
				() => loading.dismiss()
			);
		} catch (ex) {
			console.log(ex);
		}
	}



	private loadPurchaseChart() {
		const labels = [],
			data = [];
		this.sales.map((sale) => {
			labels.push(this.dateTimeService.format(sale.date, 'DD MMM YY'));
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
