import { Component } from '@angular/core';
import { ReportModule } from '../../modules/reportModule';
import { PageModule } from '../../metadata/pageModule';
import { ProductService } from "../../services/productService";
import { StockHistoryService } from "../../services/stockHistoryService";
import { SyncContext } from "../../services/SyncContext";
import { LoadingController } from "ionic-angular";
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import {StoreService} from "../../services/storeService";

interface StockMovement {
  productName: string,
  startStock: number,
  received: number,
  sold: number,
  deducted: number,
  endStock: number,
  returned: number
}

@SecurityModule(SecurityAccessRightRepo.ReportStockMovementSummary)
@PageModule(() => ReportModule)
@Component({
  selector: 'report-stock-movement-summary',
  templateUrl: 'report-stock-movement-summary.html',
  styleUrls: ['/components/pages/report-stock-movement-summary.scss']
})
export class ReportStockMovementSummaryPage {




  public timeframes = [{text: "Week", value : "WEEK"}, {text: "Month", value : "MONTH"}, {text: "Custom", value : "CUSTOM"}];
  public locations = [{text: "All locations", value : ""}];
  public selectedTimeframe: string;
  public selectedStore: string;
  public stockMovementList: StockMovement[] = [];
  public reportGeneratedTime: Date;
  public fromDate: Date = new Date();
  public toDate: Date = new Date();

  constructor(private productService: ProductService,
              private stockHistoryService: StockHistoryService,
              private storeService: StoreService,
              private syncContext: SyncContext,
              private loading: LoadingController) {
  }

  async ionViewDidLoad() {
    this.fromDate.setDate(this.fromDate.getDate() - 15);
    this.selectedTimeframe = this.timeframes[0].value;
    this.selectedStore = this.locations[0].value;
    const stores = await this.storeService.getAll();
    stores.forEach(store => this.locations.push({text : store.name, value : store._id}));
    await this.loadStockReport();
  }

  public async loadStockReport(){
    let loader = this.loading.create({ content: 'Loading Products...', });
    await loader.present();
    const products = await this.productService.getAll();
    let toDate = new Date();
    let fromDate = new Date();
    let days = 7;

    if(this.selectedTimeframe === "MONTH" || this.selectedTimeframe === "WEEK"){
        this.selectedTimeframe === "WEEK" && (days = 7);
        this.selectedTimeframe === "MONTH" && (days = 30);
        fromDate.setDate(fromDate.getDate() - days);
    }else if(this.selectedTimeframe === "CUSTOM"){

            fromDate = new Date(this.fromDate);
            toDate = new Date(this.toDate);

    }

    const data = await Promise.all([this.stockHistoryService.getTotalStockValueByDate(this.selectedStore, fromDate),
        this.stockHistoryService.getAllStockHistoryByDate(this.selectedStore,
            fromDate, toDate)]);
    const stocksInitialVal = data[0];
    const stockHistory = data[1];
    const stockHistoryMapping = stockHistory.reduce((obj, data) => {
      obj[data.productId] && obj[data.productId].push(data) || (obj[data.productId] = [data]);
      return obj;
    }, {});
    const productsStockMapping = {};
    products.forEach(product => {
      if(!productsStockMapping[product._id]){
        productsStockMapping[product._id] = {
          productName: product.name,
          startStock: stocksInitialVal[product._id] || 0,
          received: 0,
          sold: 0,
          deducted: 0,
          returned: 0,
          endStock: 0,
        }
      }

      if(stockHistoryMapping[product._id]){
        stockHistoryMapping[product._id].forEach(stockInfo => {
          switch (stockInfo.reason){
              case 'Purchase':
                  productsStockMapping[product._id]['sold'] += Math.abs(stockInfo.value);
                break;
              case 'InitialValue':
                productsStockMapping[product._id]['startStock'] += stockInfo.value;
                productsStockMapping[product._id]['received'] += stockInfo.value;
                break;
              case 'NewStock':
                  productsStockMapping[product._id]['received'] += stockInfo.value;
                break;
              case 'Transfer':
                  productsStockMapping[product._id]['received'] += stockInfo.value > 0 ? stockInfo.value : 0;
                  productsStockMapping[product._id]['deducted'] += stockInfo.value < 0 ? Math.abs(stockInfo.value) : 0;
                break;
              case 'Adjustment':
                  productsStockMapping[product._id]['received'] += stockInfo.value > 0 ? stockInfo.value : 0;
                  productsStockMapping[product._id]['deducted'] += stockInfo.value < 0 ? Math.abs(stockInfo.value) : 0;
                break;
              case 'Return':
                  productsStockMapping[product._id]['returned'] += Math.abs(stockInfo.value);
                break;
              case 'InternalUse':
                  productsStockMapping[product._id]['deducted'] += Math.abs(stockInfo.value);
                break;
              case 'Damaged':
                  productsStockMapping[product._id]['deducted'] += Math.abs(stockInfo.value);
                break;
              case 'OutOfDate':
                  productsStockMapping[product._id]['deducted'] += Math.abs(stockInfo.value);
                break;
              case 'Other':
                  productsStockMapping[product._id]['received'] += stockInfo.value > 0 ? stockInfo.value : 0;
                  productsStockMapping[product._id]['deducted'] += stockInfo.value < 0 ? Math.abs(stockInfo.value) : 0;
                break;
          }
        });
        const stockHistoryProduct = productsStockMapping[product._id];
          productsStockMapping[product._id]['endStock'] = stockHistoryProduct['startStock'] +
            stockHistoryProduct['received'] - stockHistoryProduct['sold'] - stockHistoryProduct['deducted'] -
            stockHistoryProduct['returned'];
      }
    });

    this.stockMovementList = Object.keys(productsStockMapping).map(key => productsStockMapping[key]);
    this.reportGeneratedTime = new Date();
    loader.dismiss();
  }
}
