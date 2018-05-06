import { Component } from '@angular/core';
import { ReportModule } from '../../modules/reportModule';
import { PageModule } from '../../metadata/pageModule';
import { ProductService } from "../../services/productService";
import { StockHistoryService } from "../../services/stockHistoryService";
import { SyncContext } from "../../services/SyncContext";
import { LoadingController } from "ionic-angular";

interface StockMovement {
  productName: string,
  startStock: number,
  received: number,
  sold: number,
  deducted: number,
  endStock: number,
  endValue: string
}

@PageModule(() => ReportModule)
@Component({
  selector: 'report-stock-movement-summary',
  templateUrl: 'report-stock-movement-summary.html',
  styleUrls: ['/components/pages/report-stock-movement-summary.scss']
})
export class ReportStockMovementSummaryPage {

  public timeframes = [{text: "Week", value : "WEEK"}, {text: "Month", value : "MONTH"}];
  public selectedTimeframe: string;
  public stockMovementList: StockMovement[] = [];
  public reportGeneratedTime: Date;
  private fieldMapping = {
    Purchase : 'sold',
    InitialValue: 'startStock' ,
    NewStock: 'received',
    Transfer: 'deducted'
  }
  constructor(private productService: ProductService,
              private stockHistoryService: StockHistoryService,
              private syncContext: SyncContext,
              private loading: LoadingController) {
  }

  async ionViewDidLoad() {
    this.selectedTimeframe = this.timeframes[0].value;
    await this.loadStockReport();
  }

  public async loadStockReport(){
    let loader = this.loading.create({ content: 'Loading Products...', });
    await loader.present();
    const products = await this.productService.getAll();
    const toDate = new Date();
    const fromDate = new Date();
    let days = 7;
    if(this.selectedTimeframe === "MONTH"){
      days = 30;
    }
    fromDate.setDate(fromDate.getDate() - days);
    const stockHistory = await this.stockHistoryService.getAllStockHistoryByDate(this.syncContext.currentStore._id,
      fromDate, toDate);
    const stockHistoryMapping = stockHistory.reduce((obj, data) => {
      obj[data.productId] && obj[data.productId].push(data) || (obj[data.productId] = [data]);
      return obj;
    }, {});
    const productsStockMapping = {};
    products.forEach(product => {
      if(!productsStockMapping[product._id]){
        productsStockMapping[product._id] = {
          productName: product.name,
          startStock: 0,
          received: 0,
          sold: 0,
          deducted: 0,
          endStock: 0,
          endValue: ''
        }
      }
      if(stockHistoryMapping[product._id]){
        stockHistoryMapping[product._id].forEach(stockInfo => {
          if(this.fieldMapping[stockInfo.reason]){
            productsStockMapping[product._id][this.fieldMapping[stockInfo.reason]] += Math.abs(stockInfo.value);
          }
        });
      }
    });

    this.stockMovementList = Object.keys(productsStockMapping).map(key => productsStockMapping[key]);
    this.reportGeneratedTime = new Date();
    loader.dismiss();
  }
}
