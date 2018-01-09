import _ from 'lodash';
import { ViewDiscountSurchargesModal } from './modals/view-discount-surcharge/view-discount-surcharge';
import { HelperService } from './../../services/helperService';
import { DiscountSurchargeModal } from './modals/discount-surcharge/discount-surcharge';
import { GroupByPipe } from './../../pipes/group-by.pipe';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertController, ModalController, ToastController } from 'ionic-angular';
import { ParkSale } from './../../pages/sales/modals/park-sale';
import { SalesServices } from './../../services/salesService';
import { Sale, DiscountSurchargeInterface } from './../../model/sale';
import { BasketItem } from './../../model/basketItem';
import { GlobalConstants } from './../../metadata/globalConstants';
import { ItemInfoModal } from './item-info-modal/item-info';
import { Customer } from '../../model/customer';
import { CreateCustomerModal } from './modals/create-customer/create-customer';
import { CustomerService } from '../../services/customerService';
import { UserSession } from '../../model/UserSession';

@Component({
  selector: 'basket',
  templateUrl: 'basket.html',
  styleUrls: ['/components/basket/basket.scss'],
  providers: [SalesServices]
})
export class BasketComponent {

  public _sale: Sale;
  public _customer: Customer;
  public tax: number = 0;
  public oldValue: number = 1;
  public balance: number = 0;
  public disablePaymentBtn = false;
  public payBtnText = "Pay";
  public employeesHash: any;
  public saleAppliedValue: number;
  public appliedValueDetails: any;
  public searchBarEnabled: boolean = true;
  public showSearchCancel: boolean = false;
  public searchInput: string = "";
  public searchedCustomers: any[] = [];

  set sale(obj: Sale) {
    this._sale = obj;
    this.saleChange.emit(obj);
  }

  get sale() {
    return this._sale;
  }

  @Input() user: UserSession;
  @Input() refund: boolean;
  @Input()
  set customer(model: Customer) {
    this._customer = model;
    this.customerChange.emit(model);
    this.searchInput = "";
    if (!this._customer) {
      this.searchBarEnabled = true;
    } else if (this._customer) {
      this.searchBarEnabled = false;
    }
  }
  get customer(): Customer {
    return this._customer;
  }

  @Input('employees')
  set employee(arr: Array<any>) {
    this.employeesHash = _.keyBy(arr, '_id');
  }

  @Input('_sale')
  set model(obj: Sale) {
    this._sale = obj;
    this.setBalance();
    this.sale.completed = false;
    this.generatePaymentBtnText();
  }

  get model(): Sale {
    return this.sale;
  }

  @Output() paymentClicked = new EventEmitter<any>();
  @Output() notify = new EventEmitter<any>();
  @Output() customerChange = new EventEmitter<Customer>();
  @Output('_saleChange') saleChange = new EventEmitter<Sale>();


  constructor(
    private salesService: SalesServices,
    private alertController: AlertController,
    private groupByPipe: GroupByPipe,
    private helperService: HelperService,
    private customerService: CustomerService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController) {
  }

  public setBalance() {
    if (!this.refund) {
      this.balance = this.sale.payments && this.sale.payments.length > 0 ?
        this.sale.taxTotal - this.sale.payments
          .map(payment => payment.amount)
          .reduce((a, b) => a + b) : this.sale.taxTotal;
    } else {
      this.balance = this.sale.taxTotal;
    }
    this.sale.state = this.balance > 0 ? 'current' : 'refund';
  }

  public addItemToBasket(item: BasketItem) {
    var index = _.findIndex(this.sale.items, (_item: BasketItem) => {
      return (_item._id == item._id && _item.finalPrice == item.finalPrice && _item.employeeId == item.employeeId)
    });
    index === -1 ? this.sale.items.push(item) : this.sale.items[index].quantity++;
    this.sale.items = this.groupByPipe.transform(this.sale.items, 'employeeId');
    this.calculateAndSync();
  }

  public removeItem($index) {
    this.sale.items.splice($index, 1);
    this.sale.items = this.groupByPipe.transform(this.sale.items, 'employeeId');
    this.calculateAndSync();
  }

  public syncSale() {
    return this.salesService.update(this.sale).then(
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
      if (data) {
        if (data.hasChanged && data.buffer.employeeId != data.item.employeeId) reorder = true;
        this.sale.items[$index] = data.item;
        if (reorder) this.sale.items = this.groupByPipe.transform(this.sale.items, 'employeeId');
        data.hasChanged && this.calculateAndSync();
      }
    });
    modal.present();
  }

  public openDiscountSurchargeModal() {
    let modal = this.modalCtrl.create(DiscountSurchargeModal);
    modal.onDidDismiss(data => {
      if (data) {
        this.sale.appliedValues.push(<DiscountSurchargeInterface>data);
        this.calculateAndSync();
      }
    });
    modal.present();
  }

  public viewAppliedValues() {
    let modal = this.modalCtrl.create(ViewDiscountSurchargesModal, { values: this.sale.appliedValues });
    modal.onDidDismiss(data => {
      if (data) {
        this.sale.appliedValues = <DiscountSurchargeInterface[]>data;
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
    if (this.sale.items && this.sale.items.length > 0) {
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
    let modal = this.modalCtrl.create(ParkSale, { sale: this.sale });
    modal.onDidDismiss(data => {
      if (data.status) {
        let confirm = this.alertController.create({
          title: 'Sale Parked!',
          subTitle: 'Your sale has successfully been parked',
          buttons: [
            {
              'text': 'OK',
              handler: () => {
                this.salesService.instantiateSale().then((sale: any) => {
                  this.customer = null;
                  this.sale = sale.sale;
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
            this.salesService.delete(this.sale).then(() => {
              localStorage.removeItem('sale_id');
              this.customer = null;
              this.salesService.instantiateSale().then((sale: any) => {
                this.sale = sale.sale;
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
    this.searchInput = "";
    this.searchBarEnabled = false;
  }

  public async searchCustomers($event: any) {
    if (this.searchInput && this.searchInput.trim() != '' && this.searchInput.length > 1) {
      try {
        let customers: Customer[] = await this.customerService.searchByName(this.searchInput);
        this.searchedCustomers = customers;
        return;
      } catch (err) {
        return Promise.reject(err);
      }
    } else {
      this.searchedCustomers = [];
      return await Promise.resolve([]);
    }
  }

  public openSearchbar() {
    if (this.sale.items.length > 0) {
      this.searchBarEnabled = true;
    } else {
      let toast = this.toastCtrl.create({ message: 'Please add items first', duration: 3000 });
      toast.present();
    }
  }

  public assignCustomer(customer: Customer) {
    this.customer = customer;
    this.sale.customerKey = this.customer._id;
    this.salesService.update(this.sale);
    this.salesService.manageSaleId(this.sale);
  }

  public unassignCustomer() {
    this.customer = null;
    this.sale.customerKey = null;
    this.sale.items.length > 0 ?
      this.salesService.update(this.sale) :
      this.salesService.delete(this.sale);
    this.salesService.manageSaleId(this.sale);
  }

  public createCustomer() {
    let modal = this.modalCtrl.create(CreateCustomerModal, {
      searchInput: this.searchInput
    });
    modal.onDidDismiss(customer => {
      if (customer) {
        this.customer = customer;
        this.sale.customerKey = this.customer._id;
        this.salesService.update(this.sale);
      }
    });
    modal.present();
  }

  public editCustomer() {
    let modal = this.modalCtrl.create(CreateCustomerModal, {
      customer: this.customer
    });
    modal.onDidDismiss(customer => {
      if (customer) {
        this.customer = customer;
        this.sale.customerKey = this.customer._id;
        this.salesService.update(this.sale);
      }
    });
    modal.present();
  }

  private calculateAndSync() {
    this.salesService.manageSaleId(this.sale);
    this.calculateTotal(() => {
      this.setBalance();
      this.generatePaymentBtnText();
      if (this.sale.items.length > 0) {
        this.salesService.update(this.sale);
      } else {
        if (this.sale.customerKey) {
          this.salesService.update(this.sale);
        } else {
          this.salesService.delete(this.sale);
          this.customer = null;
        }
      }
    });
  }

  private calculateTotal(callback) {
    this.salesService.calculateSale(this.sale);
    callback();
  }
}