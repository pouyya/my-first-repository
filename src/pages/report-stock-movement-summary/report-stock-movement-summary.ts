import { Component } from '@angular/core';
import { ReportModule } from '../../modules/reportModule';
import { PageModule } from '../../metadata/pageModule';
import { StockHistoryService, StockMovement } from "../../services/stockHistoryService";
import { LoadingController } from "ionic-angular";
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { StoreService } from "../../services/storeService";
import { SyncContext } from '../../services/SyncContext';
import { NetworkService } from '../../services/networkService';


@SecurityModule(SecurityAccessRightRepo.ReportStockMovementSummary)
@PageModule(() => ReportModule)
@Component({
  selector: 'report-stock-movement-summary',
  templateUrl: 'report-stock-movement-summary.html',
  styleUrls: ['/components/pages/report-stock-movement-summary.scss']
})
export class ReportStockMovementSummaryPage {

  public timeframes = [{ text: "Week", value: "WEEK" }, { text: "Month", value: "MONTH" }, { text: "Custom", value: "CUSTOM" }];
  public locations = [{ text: "All locations", value: "" }];
  public selectedTimeframe: string;
  public selectedStore: string;
  public stockMovementList: StockMovement[] = [];
  public reportGeneratedTime: Date;
  public fromDate: Date = new Date();
  public toDate: Date = new Date();
  networkStatus: boolean;

  constructor(private stockHistoryService: StockHistoryService,
    private storeService: StoreService,
    private loading: LoadingController,
    private syncContext: SyncContext,
    private networkService: NetworkService
  ) {
  }

  async ionViewDidLoad() {
    this.networkService.statusConfirmed$.subscribe(
      status => {
        this.networkStatus = status;
      });

    this.networkService.announceStatus(true);
    this.fromDate.setDate(this.fromDate.getDate() - 15);
    this.selectedTimeframe = this.timeframes[0].value;
    const stores = await this.storeService.getAll();
    stores.forEach(store => this.locations.push({ text: store.name, value: store._id }));

    const storeId = this.syncContext.currentStore && this.syncContext.currentStore._id;
    this.selectedStore = (storeId) ? storeId : this.locations[0].value;

    await this.loadStockReport();
  }

  public async loadStockReport() {
    let loader = this.loading.create({ content: 'Loading Report...', });
    await loader.present();
    let toDate = new Date();
    let fromDate = new Date();
    let days = 7;

    if (this.selectedTimeframe === "MONTH" || this.selectedTimeframe === "WEEK") {
      this.selectedTimeframe === "WEEK" && (days = 7);
      this.selectedTimeframe === "MONTH" && (days = 30);
      fromDate.setDate(fromDate.getDate() - days);
    } else if (this.selectedTimeframe === "CUSTOM") {

      fromDate = new Date(this.fromDate);
      toDate = new Date(this.toDate);

    }

    var stockMovement = await this.stockHistoryService.getStockMovement(this.selectedStore, fromDate, toDate);
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
