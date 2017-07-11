import _ from 'lodash';
import { ParkSale } from './../../pages/sales/modals/park-sale';
import { HelperService } from './../../services/helperService';
import { FountainService } from './../../services/fountainService';
import { Platform, AlertController, ModalController, NavController } from 'ionic-angular';
import { SalesServices } from './../../services/salesService';
import { CalculatorService } from './../../services/calculatorService';
import { TaxService } from './../../services/taxService';
import { Sale } from './../../model/sale';
import { PurchasableItem } from './../../model/purchasableItem';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BucketItem } from './../../model/bucketItem';
import { GlobalConstants } from './../../metadata/globalConstants';

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
  public disablePaymentBtn = false;
  public payBtnText = "Pay";
  private shownItem: any = null;

  static readonly PAY = 'Pay';
  static readonly RETURN = 'Return';
  static readonly DONE = 'Done';

  @Input() refund: boolean;
  @Input('_invoice')
  set model(obj: Sale) {
    this.invoice = obj;
    this.shownItem = null;
    this.setBalance();
    this.invoice.completed = false;
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
    if(!this.refund) {
      this.balance = this.invoice.payments && this.invoice.payments.length > 0 ?
        this.invoice.taxTotal - this.invoice.payments
          .map(payment => payment.amount)
          .reduce((a, b) => a + b) : this.invoice.taxTotal;      
    } else {
      this.balance = this.invoice.taxTotal;
    }
    this.invoice.state  = this.balance > 0 ? 'current' : 'refund';
  }

  private calculateAndSync() {
    this.salesService.manageInvoiceId(this.invoice);
    this.calculateTotal(() => {
      this.setBalance();
      this.generatePaymentBtnText();
      this.salesService.update(this.invoice);
    });
  }

  public addItemToBasket(item: PurchasableItem) {
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
    this.invoice.items.splice($index, 1);
    this.calculateAndSync();
  }

  public updatePrice(item: BucketItem) {
    item.discount = this.helper.round2Dec(this.calcService.findDiscountPercent(item.actualPrice, item.finalPrice));
    this.calculateAndSync();
  }

  public calculateDiscount(item: BucketItem) {
    item.discount = this.helper.round2Dec(item.discount);
    item.finalPrice = item.discount > 0 ?
      this.calcService.calcItemDiscount(item.discount, item.actualPrice) :
      item.actualPrice;
    this.calculateAndSync();
  }

  public addQuantity(item: BucketItem) {
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
    this.paymentClicked.emit({ balance: this.balance, operation: this.payBtnText });
  }

	private generatePaymentBtnText() {
    this.payBtnText = GlobalConstants.PAY_BTN
		if(this.invoice.items.length > 0) {
      this.disablePaymentBtn = false;
      if(this.balance == 0) {
        this.payBtnText = GlobalConstants.DONE_BTN
      } else if(this.balance < 0) {
        this.payBtnText = GlobalConstants.RETURN_BTN;
      }
		} else {
      this.disablePaymentBtn = true;
    }
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
      this.salesService.calculateSale(this.invoice);
      callback();
    }, 0);
  }
}