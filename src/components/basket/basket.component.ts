import { PrintService } from './../../services/printService';
import _ from 'lodash';
import * as moment from 'moment';
import { ViewDiscountSurchargesModal } from './modals/view-discount-surcharge/view-discount-surcharge';
import { DiscountSurchargeModal } from './modals/discount-surcharge/discount-surcharge';
import { GroupByPipe } from './../../pipes/group-by.pipe';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertController, ModalController, ToastController, NavController, LoadingController } from 'ionic-angular';
import { ParkSale } from './../../pages/sales/modals/park-sale';
import { SalesServices } from './../../services/salesService';
import { Sale, DiscountSurchargeInterface } from './../../model/sale';
import { BasketItem } from './../../model/basketItem';
import { GlobalConstants } from './../../metadata/globalConstants';
import { ItemInfoModal } from './item-info-modal/item-info';
import { Customer } from '../../model/customer';
import { CreateCustomerModal } from './modals/create-customer/create-customer';
import { CustomerService } from '../../services/customerService';
import { CalculatorService } from '../../services/calculatorService';
import { TaxService } from '../../services/taxService';
import { BaseTaxIterface } from '../../model/baseTaxIterface';
import { PriceBook } from '../../model/priceBook';
import { PriceBookService } from '../../services/priceBookService';
import { EvaluationContext } from '../../services/EvaluationContext';
import { PurchasableItemPriceInterface } from '../../model/purchasableItemPrice.interface';
import { PurchasableItem } from '../../model/purchasableItem';
import { Store } from '../../model/store';
import { StoreService } from '../../services/storeService';
import { PaymentsPage } from '../../pages/payment/payment';
import { UserSession } from '../../modules/dataSync/model/UserSession';
import { FountainService } from './../../services/fountainService';

@Component({
  selector: 'basket',
  templateUrl: 'basket.html',
  styleUrls: ['/components/basket/basket.scss'],
  providers: [SalesServices]
})
export class BasketComponent {

  public customer: Customer;
  public balance: number = 0;
  public disablePaymentBtn = false;
  public payBtnText = "Pay";
  public employeesHash: any;
  public searchBarEnabled: boolean = true;
  public showSearchCancel: boolean = false;
  public searchInput: string = "";
  public searchedCustomers: any[] = [];
  private salesTaxes: BaseTaxIterface[];
  private defaultTax: BaseTaxIterface;
  private priceBooks: PriceBook[];
  private store: Store;
  private refund: boolean;
  private sale: Sale;
  private evaluationContext: EvaluationContext;

  @Input() user: UserSession;

  @Input('employees')
  set employee(arr: Array<any>) {
    this.employeesHash = _.keyBy(arr, '_id');
  }

  @Output() paymentCompleted = new EventEmitter<any>();

  constructor(
    private salesService: SalesServices,
    private alertController: AlertController,
    private groupByPipe: GroupByPipe,
    private customerService: CustomerService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private priceBookService: PriceBookService,
    private fountainService: FountainService,
    private storeService: StoreService,
    private printService: PrintService,
    private loading: LoadingController,
    private navCtrl: NavController) {
  }

  public async initializeSale(sale: Sale, refund: boolean, evaluationContext: EvaluationContext) {

    await this.loadBaseData();

    this.evaluationContext = evaluationContext;

    if (!sale) {
      sale = await this.salesService.instantiateSale()
    }

    let customer: Customer = null;
    if (sale.state == 'current') {
      await this.recalculateSaleAmounts(sale);
      sale = await this.salesService.update(sale);
    }

    if (sale.customerKey) {
      customer = await this.customerService.get(sale.customerKey);
    }

    this.sale = sale;
    this.customer = customer || null;
    this.setBalance();
    this.sale.completed = false;
    this.generatePaymentBtnText();

    return;
  }

  private async recalculateSaleAmounts(sale: Sale) {
    for (let item of sale.items) {
      var itemPrice = await this.priceBookService.getEligibleItemPrice(this.evaluationContext, this.priceBooks, item.purchsableItemId);
      if (itemPrice) {
        item = this.salesService.calculateAndSetBasketPriceAndTax(item, this.salesTaxes, this.defaultTax, itemPrice, this.user.settings.taxType);
      }
    }
    this.salesService.calculateSale(sale);
  }

  private async loadBaseData() {
    [this.salesTaxes, this.defaultTax, this.priceBooks, this.store] =
      [await this.salesService.getSaleTaxs(),
      await this.salesService.getDefaultTax(),
      await this.priceBookService.getAllSortedByPriority(),
      await this.storeService.getCurrentStore()];
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

  public async addItemToBasket(purchasableItem: PurchasableItem, categoryId: string, currentEmployeeId: string, stockControl: boolean) {

    let itemPrice = await this.priceBookService.getEligibleItemPrice(this.evaluationContext, this.priceBooks, purchasableItem._id);

    if (itemPrice) {
      var basketItem = await this.createBasketItem(purchasableItem, categoryId, this.user.settings.taxType, itemPrice, currentEmployeeId, stockControl);

      this.updateQuantity(basketItem);

      this.sale.items = this.groupByPipe.transform(this.sale.items, 'employeeId');

      this.calculateAndSync();

    } else {
      let toast = this.toastCtrl.create({
        message: `${purchasableItem.name} does not have any price`,
        duration: 3000
      });
      await toast.present();
    }
  }


  private updateQuantity(basketItem: BasketItem) {
    var index = _.findIndex(this.sale.items, (currentSaleItem: BasketItem) => {
      return (currentSaleItem.purchsableItemId == basketItem.purchsableItemId &&
        currentSaleItem.finalPrice == basketItem.finalPrice &&
        currentSaleItem.employeeId == basketItem.employeeId);
    });
    index === -1 ? this.sale.items.push(basketItem) : this.sale.items[index].quantity++;
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
    modal.onDidDismiss(async data => {

      if (data && data.hasChanged) {

        var itemPrice = await this.priceBookService.getEligibleItemPrice(this.evaluationContext, this.priceBooks, item.purchsableItemId);

        if (itemPrice) {
          this.sale.items[$index] = this.salesService.calculateAndSetBasketPriceAndTax(data.item, this.salesTaxes, this.defaultTax, itemPrice, this.user.settings.taxType);
        }

        if (data.buffer.employeeId != data.item.employeeId) {
          this.sale.items = this.groupByPipe.transform(this.sale.items, 'employeeId');
        }

        this.calculateAndSync();
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

    let pushCallback = async params => {
      if (params) {
        this.sale = await this.salesService.instantiateSale();
        this.paymentCompleted.emit();
        this.customer = null;
      }
      this.calculateAndSync();
    }

    this.refund = this.balance < 0;
    this.navCtrl.push(PaymentsPage, {
      sale: this.sale,
      doRefund: this.refund,
      callback: pushCallback,
      store: this.store
    });
  }

  public async fastPayment() {
    let loader = this.loading.create({ content: 'Checking for stock...' });
    await loader.present();
    let stockErrors = await this.salesService.checkForStockInHand(this.sale, this.store._id);
    if (stockErrors.length > 0) {
      let alert = this.alertController.create(
        {
          title: 'Out of Stock',
          subTitle: 'Please make changes to sale and continue',
          message: `${stockErrors.join('\n')}`,
          buttons: ['Ok']
        }
      );
      loader.dismiss();
      alert.present();
      return;
    } else {
      loader.setContent('Completing Sale...');
      try {
        await loader.present();
        await this.salesService.updateStock(this.sale, this.store._id);
        this.sale.completed = true;
        this.sale.completedAt = moment().utc().format();
        this.sale.state = 'completed';
        this.sale.receiptNo = await this.fountainService.getReceiptNumber();
        await this.salesService.update(this.sale);
        if (this.store.printReceiptAtEndOfSale) {
          await this.printService.printReceipt(this.sale);
        }
        await this.printService.openCashDrawer();
        localStorage.removeItem('sale_id');
        this.sale = await this.salesService.instantiateSale();
        this.paymentCompleted.emit();
        this.customer = null;
        this.calculateAndSync();
        loader.dismiss();
      } catch (err) {
        loader.dismiss();
        return Promise.reject(err);
      }
    }
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
                  this.sale = sale;
                  this.calculateAndSync();
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
            this.salesService.delete(this.sale).then(async () => {
              localStorage.removeItem('sale_id');
              this.customer = null;
              this.sale = await this.salesService.instantiateSale();
              this.calculateAndSync();
            });
          }
        },
        { text: 'No' }
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

  public async assignCustomer(customer: Customer) {
    this.customer = customer;
    this.sale.customerKey = this.customer._id;
    await this.salesService.update(this.sale);
    this.salesService.manageSaleId(this.sale);
    this.searchBarEnabled = false;
  }

  public async unassignCustomer() {
    this.customer = null;
    this.sale.customerKey = null;
    await this.salesService.update(this.sale);
    this.salesService.manageSaleId(this.sale);
    this.searchBarEnabled = true;
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

  public calculateAndSync() {
    this.salesService.manageSaleId(this.sale);
    this.salesService.calculateSale(this.sale);
    this.setBalance();
    this.generatePaymentBtnText();
    if (this.sale.items.length > 0) {
      this.salesService.update(this.sale);
    } else {
      if (this.sale.customerKey) {
        this.salesService.update(this.sale);
      } else {
        this.customer = null;
      }
    }
  }


  private createBasketItem(purchasableItem: PurchasableItem, categoryId: string, isTaxIncl: boolean, itemPrice: PurchasableItemPriceInterface, employeeId: string, stockControl: boolean): BasketItem {

    let basketItem = new BasketItem();
    basketItem.quantity = 1;
    basketItem.discount = 0;

    basketItem.purchsableItemId = purchasableItem._id;
    basketItem.name = purchasableItem.name;

    basketItem.categoryId = categoryId;

    this.salesService.calculateAndSetBasketPriceAndTax(basketItem, this.salesTaxes, this.defaultTax, itemPrice, isTaxIncl);

    basketItem.employeeId = employeeId;

    basketItem.stockControl = stockControl;

    return basketItem;
  }


}