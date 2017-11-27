import _ from 'lodash';
import { ViewDiscountSurchargesModal } from './modals/view-discount-surcharge/view-discount-surcharge';
import { HelperService } from './../../services/helperService';
import { DiscountSurchargeModal } from './modals/discount-surcharge/discount-surcharge';
import { GroupByPipe } from './../../pipes/group-by.pipe';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertController, ModalController } from 'ionic-angular';
import { ParkSale } from './../../pages/sales/modals/park-sale';
import { SalesServices } from './../../services/salesService';
import { Sale, DiscountSurchargeInterface } from './../../model/sale';
import { BasketItem } from './../../model/bucketItem';
import { GlobalConstants } from './../../metadata/globalConstants';
import { ItemInfoModal } from './item-info-modal/item-info';
import { Customer } from '../../model/customer';
import { CreateCustomerModal } from './modals/create-customer/create-customer';

@Component({
  selector: 'basket',
  templateUrl: 'basket.html',
  styleUrls: ['/components/basket/basket.scss'],
  providers: [SalesServices]
})
export class BasketComponent {

  public _invoice: Sale;
  public tax: number = 0;
  public oldValue: number = 1;
  public balance: number = 0;
  public disablePaymentBtn = false;
  public payBtnText = "Pay";
  public employeesHash: any;
  public saleAppliedValue: number;
  public appliedValueDetails: any;
  public searchBarEnabled: boolean = false;
  public showSearchCancel: boolean = true;
  public searchedCustomers: any[] = [];

  set invoice(obj: Sale) {
    this._invoice = obj;
    this.invoiceChange.emit(obj);
  }

  get invoice() {
    return this._invoice;
  }

  @Input() user: any;
  @Input() refund: boolean;
  @Input() customer: Customer;
  @Input('employees')
  set employee(arr: Array<any>) {
    this.employeesHash = _.keyBy(arr, '_id');
  }

  @Input('_invoice')
  set model(obj: Sale) {
    this._invoice = obj;
    this.setBalance();
    this.invoice.completed = false;
    this.generatePaymentBtnText();
  }

  get model(): Sale {
    return this.invoice;
  }

  @Output() paymentClicked = new EventEmitter<any>();
  @Output() notify = new EventEmitter<any>();
  @Output('_invoiceChange') invoiceChange = new EventEmitter<Sale>();

  constructor(
    private salesService: SalesServices,
    private alertController: AlertController,
    private groupByPipe: GroupByPipe,
    private helperService: HelperService,
    private modalCtrl: ModalController) {
  }

  public setBalance() {
    if (!this.refund) {
      this.balance = this.invoice.payments && this.invoice.payments.length > 0 ?
        this.invoice.taxTotal - this.invoice.payments
          .map(payment => payment.amount)
          .reduce((a, b) => a + b) : this.invoice.taxTotal;
    } else {
      this.balance = this.invoice.taxTotal;
    }
    this.invoice.state = this.balance > 0 ? 'current' : 'refund';
  }

  public addItemToBasket(item: BasketItem) {
    var index = _.findIndex(this.invoice.items, (_item: BasketItem) => {
      return (_item._id == item._id && _item.finalPrice == item.finalPrice && _item.employeeId == item.employeeId)
    });
    index === -1 ? this.invoice.items.push(item) : this.invoice.items[index].quantity++;
    this.invoice.items = this.groupByPipe.transform(this.invoice.items, 'employeeId');
    this.calculateAndSync();
  }

  public removeItem($index) {
    this.invoice.items.splice($index, 1);
    this.invoice.items = this.groupByPipe.transform(this.invoice.items, 'employeeId');
    this.calculateAndSync();
  }

  public syncInvoice() {
    return this.salesService.update(this.invoice).then(
      response => console.log(response)
    ).catch(error => console.error(error));
  }

  public viewInfo(item: BasketItem, $index) {
    let modal = this.modalCtrl.create(ItemInfoModal, {
      purchaseableItem: item,
      employeeHash: this.employeesHash,
      settings: {
        trackStaff: this.user.settings.trackEmployeeSales
      }
    });
    modal.onDidDismiss(data => {
      let reorder = false;
      if (data.hasChanged && data.buffer.employeeId != data.item.employeeId) reorder = true;
      this.invoice.items[$index] = data.item;
      if (reorder) this.invoice.items = this.groupByPipe.transform(this.invoice.items, 'employeeId');
      data.hasChanged && this.calculateAndSync();
    });
    modal.present();
  }

  public openDiscountSurchargeModal() {
    let modal = this.modalCtrl.create(DiscountSurchargeModal);
    modal.onDidDismiss(data => {
      if (data) {
        this.invoice.appliedValues.push(<DiscountSurchargeInterface>data);
        this.calculateAndSync();
      }
    });
    modal.present();
  }

  public viewAppliedValues() {
    let modal = this.modalCtrl.create(ViewDiscountSurchargesModal, { values: this.invoice.appliedValues });
    modal.onDidDismiss(data => {
      if (data) {
        this.invoice.appliedValues = <DiscountSurchargeInterface[]>data;
        this.calculateAndSync();
      }
    });
    modal.present();
  }

  public gotoPayment() {
    this.paymentClicked.emit({ balance: this.balance, operation: this.payBtnText });
  }

  private generatePaymentBtnText() {
    this.payBtnText = GlobalConstants.PAY_BTN
    if (this.invoice.items && this.invoice.items.length > 0) {
      this.disablePaymentBtn = false;
      if (this.balance == 0) {
        this.payBtnText = GlobalConstants.DONE_BTN
      } else if (this.balance < 0) {
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
                this.salesService.instantiateInvoice().then((invoice: any) => {
                  this.invoice = invoice.invoice;
                  this.calculateAndSync();
                  this.notify.emit({ clearSale: true });
                });
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
              this.salesService.instantiateInvoice().then((invoice: any) => {
                this.invoice = invoice.invoice;
                this.calculateAndSync();
                this.notify.emit({ clearSale: true });
              });
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

  public cancelSearch($event) {
    this.searchBarEnabled = false;
  }

  public async searchCustomers($event: any) {
    let val = $event.target.value;
    if (val && val.trim() != '') {

    }
  }

  public createCustomer() {
    let modal = this.modalCtrl.create(CreateCustomerModal, {});
    modal.onDidDismiss(customer => {
      if(customer) {
        this.customer = customer;
        this.invoice.customerKey = this.customer._id;
      }
    });
    modal.present();
  }

  private calculateAndSync() {
    this.salesService.manageInvoiceId(this.invoice);
    this.calculateTotal(() => {
      this.setBalance();
      this.generatePaymentBtnText();
      this.invoice.items.length > 0 ?
        this.salesService.update(this.invoice) :
        this.salesService.delete(this.invoice)
    });
  }

  private calculateTotal(callback) {
    this.salesService.calculateSale(this.invoice);
    callback();
  }
}