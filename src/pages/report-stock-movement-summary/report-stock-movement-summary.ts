import { Component, ChangeDetectorRef } from '@angular/core';
import { ReportModule } from '../../modules/reportModule';
import { PageModule } from '../../metadata/pageModule';
import { StockHistoryService, StockMovement } from '../../services/stockHistoryService';
import { LoadingController } from 'ionic-angular';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { StoreService } from '../../services/storeService';
import { SyncContext } from '../../services/SyncContext';
import { NetworkService } from '../../services/networkService';
import { DateTimeService } from "../../services/dateTimeService";
import { Subject } from 'rxjs';

@SecurityModule(SecurityAccessRightRepo.ReportStockMovementSummary)
@PageModule(() => ReportModule)
@Component({
	selector: 'report-stock-movement-summary',
	templateUrl: 'report-stock-movement-summary.html',
	styleUrls: ['/components/pages/report-stock-movement-summary.scss']
})
export class ReportStockMovementSummaryPage {
	public locations = [{ text: 'All locations', value: '' }];
	public selectedStore: string;
	public stockMovementList: StockMovement[] = [];
	public reportGeneratedTime: Date;
	private dates$: Subject<Object> = new Subject<Object>();
	public selectedTimeframe: string;
	public fromDate: Date = new Date();
	public toDate: Date = new Date();
	networkStatus: boolean;

	constructor(private stockHistoryService: StockHistoryService,
		private storeService: StoreService,
		private loading: LoadingController,
		private syncContext: SyncContext,
		private networkService: NetworkService,
		private dateTimeService: DateTimeService,
		private cdRef: ChangeDetectorRef
	) {
	}

	async ionViewDidLoad() {
		this.networkService.statusConfirmed$.subscribe(
			status => {
				this.networkStatus = status;
			});

		this.networkService.announceStatus(true);
		this.fromDate.setDate(this.fromDate.getDate() - 15);
		const stores = await this.storeService.getAll();
		stores.forEach(store => this.locations.push({ text: store.name, value: store._id }));

		const storeId = this.syncContext.currentStore && this.syncContext.currentStore._id;
		this.selectedStore = (storeId) ? storeId : this.locations[0].value;

		this.dates$.asObservable().subscribe(async (date: any) => {
			this.fromDate = date.fromDate;
			this.toDate = date.toDate;
			await this.loadStockReport();
		});

		let fromDate = new Date(), toDate = new Date();
		fromDate.setHours(0, 0, 0, 0);
		fromDate.setDate(fromDate.getDate() - 7);
		this.dates$.next({ fromDate, toDate });
	}

	async ngAfterViewChecked() {
		this.selectedTimeframe = 'WEEK';
		this.cdRef.detectChanges();
	}

	public async loadStockReport() {
		let loader = this.loading.create({ content: 'Loading Report...' });
		await loader.present();

		this.fromDate.setHours(0, 0, 0, 0);
		this.toDate.setHours(23, 59, 59, 0);

		var stockMovement = await this.stockHistoryService.getStockMovement(
			this.selectedStore,
			this.dateTimeService.getLocalISOString(this.fromDate),
			this.dateTimeService.getLocalISOString(this.toDate));

		stockMovement.subscribe(
			stockMovementList => this.stockMovementList = stockMovementList,
			err => {
				console.log(err);
				loader.dismiss();
			},
			() => loader.dismiss()
		);
		this.reportGeneratedTime = new Date();
	}
}
