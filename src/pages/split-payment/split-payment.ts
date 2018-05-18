import { SalesServices } from './../../services/salesService';
import {Component, ViewChild} from "@angular/core";
import {NavController, NavParams, Navbar} from "ionic-angular";
import { Sale } from "../../model/sale";

@Component({
  selector: 'split-payment',
  templateUrl: 'split-payment.html',
  providers: [SalesServices]
})
export class SplitPaymentPage {

  public sale: Sale;
  public amount: number;
  public change: number;
  public doRefund: boolean;
  public moneySplit: any[] = [];
  public paid: any[] = [];
  private splitCallback: any;
  private sum: any;

  @ViewChild(Navbar) navBar: Navbar;

  constructor(
    salesService: SalesServices,
    private navCtrl: NavController,
    private navParams: NavParams) {
  }

  async ionViewDidLoad() {
      this.sale = <Sale>this.navParams.get('sale');
      this.moneySplit = this.navParams.get('moneySplit');
      this.splitCallback = this.navParams.get('splitCallback');
      this.sum = this.moneySplit.reduce((initVal, amount) => {
          return initVal+=amount;
      },0);
      this.navBar.backButtonClick = this.backBtnClick.bind(this);
  }

  private backBtnClick (e: UIEvent) {
      this.splitCallback({type: 'PAY', values: this.paid, moneySplit: this.moneySplit});
      this.navCtrl.pop();
  }

  public split( length?: number ){
    const splitsCount = length || this.moneySplit.length + 1;
    const avg = Number((this.sum / splitsCount).toFixed(2));
    this.moneySplit = [];
    for(let count = 1; count < splitsCount; count+=1) {
      this.moneySplit.push(avg);
    }
    const finalVal = (this.sum - (avg * (splitsCount-1)));
    this.moneySplit.push(Number(finalVal.toFixed(2)));
  }

  public checkout(index) {
    this.paid.push({ amount : this.moneySplit[index]});
    this.sum -= this.moneySplit[index];
    this.moneySplit.splice(index, 1);
  }

  public remove(index) {
    this.moneySplit.splice(index, 1);
    this.split(this.moneySplit.length);
  }

}