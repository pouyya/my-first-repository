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
import { ItemInfoModal } from './item-info-modal/item-info';

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
  public disablePayBtn = false;
  public balance: number = 0;

  @Input('_invoice')
  set model(obj: Sale) {
    this.invoice = obj;
    this.setBalance();
  }
  get model(): Sale { return this.invoice; }

  @Output() paymentClicked = new EventEmitter<boolean>();

  constructor(
    private salesService: SalesServices,
    private taxService: TaxService,
    private calcService: CalculatorService,
    private platform: Platform,
    private helper: HelperService,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) {
    this.tax = this.taxService.getTax();
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.setBalance();
    });
  }

  private setBalance() {
    if (this.invoice.payments && this.invoice.payments.length > 0) {
      // disable the pay button if all payments were made
      let balance = this.invoice.taxTotal - this.invoice.payments
        .map(payment => payment.amount)
        .reduce((a, b) => a + b);
      balance < 1 && (this.disablePayBtn = true);
      this.balance = balance;
    } else {
      this.balance = this.invoice.taxTotal;
    }
  }

  private calculateAndSync() {
    this.calculateTotal(() => {
      this.setBalance();
      this.salesService.update(this.invoice)
    });
  }

  public addItemToBasket(item: PurchasableItem) {
    var index = _.findIndex(this.invoice.items, (_item) => (_item._id == item._id &&_item.finalPrice == item.price));
    if(index === -1) {
      let bucketItem = this.salesService.prepareBucketItem(item);
      this.invoice.items.push(bucketItem);
    } else {
      this.invoice.items[index].quantity++ ;
    }
    this.calculateAndSync();
  }

  public removeItem(item: BucketItem, $index) {
    this.invoice.items.splice($index, 1);
    this.calculateAndSync();
  }

  public syncInvoice() {
    return this.salesService.update(this.invoice).then(
      response => console.log(response)
    ).catch(error => console.error(error));
  }

  public viewInfo(item: BucketItem, $index) {
    let modal = this.modalCtrl.create(ItemInfoModal, { purchaseableItem: item });
    modal.onDidDismiss(data => {
      this.invoice.items[$index] = data.item;
      data.hasChanged && this.calculateAndSync();
    });
    modal.present();
  }

  public gotoPayment() {
    this.paymentClicked.emit(true);
  }

  public parkSale() {
    let modal = this.modalCtrl.create(ParkSale, { invoice: this.invoice });
    modal.onDidDismiss(data => {
      if (data.status) {
        // clear invoice
        localStorage.removeItem('pos_id');
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
      } else if(data.error) {
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
              localStorage.removeItem('pos_id');
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

  public calculateTotal(callback) {
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