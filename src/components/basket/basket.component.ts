import { PosService } from './../../services/posService';
import _ from 'lodash';
import { ParkSale } from './../../pages/sales/modals/park-sale';
import { HelperService } from './../../services/helperService';
import { FountainService } from './../../services/fountainService';
import { Platform, AlertController, ModalController, NavController } from 'ionic-angular';
import { SalesServices } from './../../services/salesService';
import { CalculatorService } from './../../services/calculatorService';
import { TaxService } from './../../services/taxService';
import { Sale } from './../../model/sale';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BucketItem } from './../../model/bucketItem';
import { GlobalConstants } from './../../metadata/globalConstants';
import { ItemInfoModal } from './item-info-modal/item-info';

@Component({
  selector: 'basket',
  templateUrl: 'basket.html',
  styleUrls: ['/components/basket/basket.scss'],
  providers: [SalesServices, TaxService, CalculatorService]
})
export class BasketComponent {

  public invoice: Sale;
  public tax: number = 0;
  public oldValue: number = 1;
  public balance: number = 0;
  public disablePaymentBtn = false;
  public payBtnText = "Pay";

  @Input() refund: boolean;
  @Input('_invoice')
  set model(obj: Sale) {
    this.invoice = obj;
    this.setBalance();
    this.invoice.completed = false;
    this.generatePaymentBtnText();
  }
  get model(): Sale { return this.invoice; }

  @Output() paymentClicked = new EventEmitter<any>();
  @Output() notify = new EventEmitter<any>();

  constructor(
    private salesService: SalesServices,
    private taxService: TaxService,
    private calcService: CalculatorService,
    private fountainService: FountainService,
    private posService: PosService,
    private platform: Platform,
    private helper: HelperService,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) {
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

  public addItemToBasket(item: any) {
    var index = _.findIndex(this.invoice.items, (_item) => (_item._id == item._id &&_item.finalPrice == item.priceBook.retailPrice));
    if(index === -1) {
      let bucketItem: BucketItem = this.salesService.prepareBucketItem(item, this.tax);
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
                this.salesService.instantiateInvoice(this.posService.getCurrentPosID()).then((invoice: Sale) => {
                  this.invoice = invoice;
                  this.calculateAndSync();
                  this.notify.emit({ clearSale: true });
                });                
                // this.navCtrl.setRoot(this.navCtrl.getActive().component);
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
              this.salesService.instantiateInvoice(this.posService.getCurrentPosID()).then((invoice: Sale) => {
                this.invoice = invoice;
                this.calculateAndSync();
                this.notify.emit({ clearSale: true });
              });
              // this.navCtrl.setRoot(this.navCtrl.getActive().component);
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
      let data = this.salesService.calculateSale(this.invoice);
      this.tax = data.tax;
      callback();
    }, 0);
  }
}