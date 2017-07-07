import { FountainService } from './../../services/fountainService';
import _ from 'lodash';
import { ParkSale } from './../../pages/sales/modals/park-sale';
import { HelperService } from './../../services/helperService';
import { Platform, AlertController, ModalController, NavController } from 'ionic-angular';
import { SalesServices } from './../../services/salesService';
import { CalculatorService } from './../../services/calculatorService';
import { TaxService } from './../../services/taxService';
import { Sale } from './../../model/sale';
import { PurchasableItem } from './../../model/purchasableItem';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BucketItem } from './../../model/bucketItem';

@Component({
  selector: 'basket',
  templateUrl: 'basket.html',
  styleUrls: ['/components/basket/basket.scss'],
  providers: [SalesServices, TaxService, CalculatorService]
})
export class BasketComponent {

  public invoice: Sale;
  public tax: number;
  public oldValue: number = 1;
  public balance: number = 0;
  private shownItem: any = null;

  @Input() refund: boolean;
  @Input('_invoice')
  set model(obj: Sale) {
    this.invoice = obj;
    this.shownItem = null;
    this.setBalance();
  }
  get model(): Sale { return this.invoice; }

  @Output() paymentClicked = new EventEmitter<any>();

  constructor(
    private salesService: SalesServices,
    private taxService: TaxService,
    private calcService: CalculatorService,
    private fountainService: FountainService,
    private platform: Platform,
    private helper: HelperService,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) {
    this.tax = this.taxService.getTax();
  }

  private setBalance() {
    if (!this.refund) {
      this.balance = this.invoice.payments && this.invoice.payments.length > 0 ?
        this.invoice.taxTotal - this.invoice.payments
          .map(payment => payment.amount)
          .reduce((a, b) => a + b) : this.invoice.taxTotal;
    } else {
      this.invoice.items = this.invoice.items.map((item) => {
        item.quantity *= -1
        return item;
      });
      this.invoice.subTotal *= -1;
      this.invoice.taxTotal *= -1;
      this.balance = this.invoice.taxTotal;
    }
  }

  private calculateAndSync() {
    this.salesService.manageInvoiceId(this.invoice);
    this.calculateTotal(() => {
      this.setBalance();
      this.salesService.update(this.invoice);
    });
  }

  public addItemToBasket(item: PurchasableItem) {
    this.invoice.completed = false;
    var index = _.findIndex(this.invoice.items, { _id: item._id });
    if (index === -1) {
      let bucketItem = this.salesService.prepareBucketItem(item);
      this.invoice.items.push(bucketItem);
    } else {
      this.invoice.items[index].quantity++;
    }
    this.calculateAndSync();
  }

  public removeItem(item: BucketItem, $index) {
    this.invoice.completed = false;
    this.invoice.items.splice($index, 1);
    this.calculateAndSync();
  }

  public updatePrice(item: BucketItem) {
    this.invoice.completed = false;
    item.discount = this.helper.round2Dec(this.calcService.findDiscountPercent(item.actualPrice, item.finalPrice));
    this.calculateAndSync();
  }

  public calculateDiscount(item: BucketItem) {
    this.invoice.completed = false;
    item.discount = this.helper.round2Dec(item.discount);
    item.finalPrice = item.discount > 0 ?
      this.calcService.calcItemDiscount(item.discount, item.actualPrice) :
      item.actualPrice;
    this.calculateAndSync();
  }

  public addQuantity(item: BucketItem) {
    this.invoice.completed = false;
    this.calculateAndSync();
  }

  public syncInvoice() {
    return this.salesService.update(this.invoice).then(
      response => console.log(response)
    ).catch(error => console.error(error));
  }

  public toggleItem(id: string): void {
    this.shownItem = this.isItemShown(id) ? null : id;
  }

  public isItemShown(id: string): boolean {
    return this.shownItem === id;
  }

  public gotoPayment() {
    this.paymentClicked.emit({ balance: this.balance });
  }

  public parkSale() {
    let modal = this.modalCtrl.create(ParkSale, { invoice: this.invoice });
    modal.onDidDismiss(data => {
      if (data.status) {
        let confirm = this.alertController.create({
          title: 'Invoice Parked!',
          subTitle: 'Your invoice has successfully been parked',
          buttons: [
            {
              'text': 'OK',
              handler: () => {
                this.navCtrl.setRoot(this.navCtrl.getActive().component);
              }
            }
          ]
        });
        confirm.present();
      } else if (data.error) {
        let error = this.alertController.create({
          title: 'ERROR',
          message: data.error || 'An error has occurred :(',
          buttons: ['OK']
        });
        error.present();
      }
    });
    modal.present();
  }

  public discardSale() {
    let confirm = this.alertController.create({
      title: 'Discard Sale',
      message: 'Do you wish to discard this sale ?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.salesService.delete(this.invoice).then(() => {
              localStorage.removeItem('invoice_id');
              this.navCtrl.setRoot(this.navCtrl.getActive().component);
            }).catch((error) => console.log(new Error()));
          }
        },
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        }
      ]
    });
    confirm.present();
  }

  private calculateTotal(callback) {
    setTimeout(() => {
      if (this.invoice.items.length > 0) {
        this.invoice.subTotal = this.invoice.totalDiscount = 0;
        this.invoice.items.forEach(item => {
          this.invoice.subTotal += (item.finalPrice * item.quantity);
          this.invoice.totalDiscount += ((item.actualPrice - item.finalPrice) * item.quantity);
        });
        this.invoice.taxTotal = this.helper.round2Dec(this.taxService.calculate(this.invoice.subTotal));
        let roundedTotal = this.helper.round10(this.invoice.taxTotal, -1);
        this.invoice.round = roundedTotal - this.invoice.taxTotal;
        this.invoice.taxTotal = roundedTotal;
        callback();
      } else {
        this.invoice.subTotal = 0;
        this.invoice.taxTotal = 0;
        this.invoice.round = 0;
        this.invoice.totalDiscount = 0;
        callback();
      }
    }, 0);
  }
}