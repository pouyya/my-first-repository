import _ from 'lodash';
import { ViewDiscountSurchargesModal } from './modals/view-discount-surcharge/view-discount-surcharge';
import { HelperService } from './../../services/helperService';
import { DiscountSurchargeModal } from './modals/discount-surcharge/discount-surcharge';
import { GroupByPipe } from './../../pipes/group-by.pipe';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertController, ModalController, ToastController, NavController } from 'ionic-angular';
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

  @Input() user: UserSession;
  @Input() refund: boolean;
  @Input() evaluationContext: EvaluationContext;

  @Input('employees')
  set employee(arr: Array<any>) {
    this.employeesHash = _.keyBy(arr, '_id');
  }

  private _sale: Sale;
  @Input('sale')
  set sale(sale: Sale) {

    var setSale = async (saleData: Sale) => {

      if (saleData.state == 'current' && !this._sale) {
        saleData = await this.salesService.reCalculateInMemorySale(
          this.evaluationContext,
          saleData,
          this.priceBooks,
          this.salesTaxes,
          this.defaultTax,
          this.user.settings.taxType);

          await this.salesService.update(saleData);
      }

      this._sale = saleData;
      this.setBalance();
      this._sale.completed = false;
      this.generatePaymentBtnText();
    }

    if (!sale) {
      this.salesService.instantiateSale().then(async newSale => {
        await setSale(newSale);
      });
    }
    else {
      setSale(sale);
    }
  }

  get sale(): Sale {
    return this._sale;
  }

  @Output() paymentCompleted = new EventEmitter<any>();

  constructor(
    private salesService: SalesServices,
    private alertController: AlertController,
    private groupByPipe: GroupByPipe,
    private helperService: HelperService,
    private customerService: CustomerService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private calcService: CalculatorService,
    private taxService: TaxService,
    private priceBookService: PriceBookService,
    private storeService: StoreService,
    private navCtrl: NavController) {
  }

  async ngOnInit() {

    await this.loadTaxAndPriceBook();
    this.store = await this.storeService.getCurrentStore()


  }


  private async loadTaxAndPriceBook() {
    [this.salesTaxes, this.defaultTax, this.priceBooks] =
      [await this.salesService.getSaleTaxs(),
      await this.salesService.getDefaultTax(),
      await this.priceBookService.getAllSortedByPriority()];
  }

  public setBalance() {
    if (!this.refund) {
      this.balance = this._sale.payments && this._sale.payments.length > 0 ?
        this._sale.taxTotal - this._sale.payments
          .map(payment => payment.amount)
          .reduce((a, b) => a + b) : this._sale.taxTotal;
    } else {
      this.balance = this._sale.taxTotal;
    }
    this._sale.state = this.balance > 0 ? 'current' : 'refund';
  }

  public async addItemToBasket(purchasableItem: PurchasableItem, categoryId: string, currentEmployeeId: string, stockControl: boolean) {

    let priceBook = await this.salesService.getItemPrice(this.evaluationContext, this.priceBooks, purchasableItem._id);

    if (priceBook) {
      var basketItem = await this.prepareBasketItem(purchasableItem, categoryId, this.user.settings.taxType, priceBook, currentEmployeeId, stockControl);

      this.updateQuantity(basketItem);

      this._sale.items = this.groupByPipe.transform(this._sale.items, 'employeeId');

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
    var index = _.findIndex(this._sale.items, (currentSaleItem: BasketItem) => {
      return (currentSaleItem._id == basketItem._id &&
        currentSaleItem.finalPrice == basketItem.finalPrice &&
        currentSaleItem.employeeId == basketItem.employeeId);
    });
    index === -1 ? this._sale.items.push(basketItem) : this._sale.items[index].quantity++;
  }

  public removeItem($index) {
    this._sale.items.splice($index, 1);
    this._sale.items = this.groupByPipe.transform(this._sale.items, 'employeeId');
    this.calculateAndSync();
  }

  public syncSale() {
    return this.salesService.update(this._sale).then(
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
        this._sale.items[$index] = data.item;
        if (reorder) this._sale.items = this.groupByPipe.transform(this._sale.items, 'employeeId');
        data.hasChanged && this.calculateAndSync();
      }
    });
    modal.present();
  }

  public openDiscountSurchargeModal() {
    let modal = this.modalCtrl.create(DiscountSurchargeModal);
    modal.onDidDismiss(data => {
      if (data) {
        this._sale.appliedValues.push(<DiscountSurchargeInterface>data);
        this.calculateAndSync();
      }
    });
    modal.present();
  }

  public viewAppliedValues() {
    let modal = this.modalCtrl.create(ViewDiscountSurchargesModal, { values: this._sale.appliedValues });
    modal.onDidDismiss(data => {
      if (data) {
        this._sale.appliedValues = <DiscountSurchargeInterface[]>data;
        this.calculateAndSync();
      }
    });
    modal.present();
  }

  public gotoPayment() {

    let pushCallback = async params => {
      if (params) {
        this._sale = await this.salesService.instantiateSale();
        this.paymentCompleted.emit();
        this.customer = null;
      } else {
        this.calculateAndSync();
      }
    }

    this.refund = this.balance < 0;
    this.navCtrl.push(PaymentsPage, {
      sale: this._sale,
      doRefund: this.refund,
      callback: pushCallback,
      store: this.store
    });
  }

  private generatePaymentBtnText() {
    this.payBtnText = GlobalConstants.PAY_BTN
    if (this._sale.items && this._sale.items.length > 0) {
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
    let modal = this.modalCtrl.create(ParkSale, { sale: this._sale });
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
                  this._sale = sale;
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
            this.salesService.delete(this._sale).then(async () => {
              localStorage.removeItem('sale_id');
              this.customer = null;
              this._sale = await this.salesService.instantiateSale();
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
    if (this._sale.items.length > 0) {
      this.searchBarEnabled = true;
    } else {
      let toast = this.toastCtrl.create({ message: 'Please add items first', duration: 3000 });
      toast.present();
    }
  }

  public async assignCustomer(customer: Customer) {
    this.customer = customer;
    this._sale.customerKey = this.customer._id;
    await this.salesService.update(this._sale);
    this.salesService.manageSaleId(this._sale);
  }

  public async unassignCustomer() {
    this.customer = null;
    this._sale.customerKey = null;
    await this.salesService.update(this._sale);
    this.salesService.manageSaleId(this._sale);
  }

  public createCustomer() {
    let modal = this.modalCtrl.create(CreateCustomerModal, {
      searchInput: this.searchInput
    });
    modal.onDidDismiss(customer => {
      if (customer) {
        this.customer = customer;
        this._sale.customerKey = this.customer._id;
        this.salesService.update(this._sale);
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
        this._sale.customerKey = this.customer._id;
        this.salesService.update(this._sale);
      }
    });
    modal.present();
  }

  public calculateAndSync() {
    this.salesService.manageSaleId(this._sale);
    this.calculateTotal(() => {
      this.setBalance();
      this.generatePaymentBtnText();
      if (this._sale.items.length > 0) {
        this.salesService.update(this._sale);
      } else {
        if (this._sale.customerKey) {
          this.salesService.update(this._sale);
        } else {
          this.customer = null;
        }
      }
    });
  }

  private calculateTotal(callback) {
    this.salesService.calculateSale(this._sale);
    callback();
  }

  private async prepareBasketItem(item: PurchasableItem, categoryId: string, taxInclusive: boolean, purchasableItemPriceInterface: PurchasableItemPriceInterface, employeeId: string, stockControl: boolean): Promise<BasketItem> { //need to be move to SalesBasket module

    let basketItem = new BasketItem();
    basketItem._id = item._id;
    basketItem.categoryId = categoryId;
    item._rev && (basketItem._rev = item._rev);
    basketItem.name = item.name;
    basketItem.tax = purchasableItemPriceInterface.salesTaxId != null ?
      _.find(this.salesTaxes, salesTaxe => salesTaxe._id == purchasableItemPriceInterface.salesTaxId)
      : this.defaultTax;
    basketItem.priceBook = purchasableItemPriceInterface;
    basketItem.priceBook.inclusivePrice = this.helperService.round2Cents(this.taxService.calculate(purchasableItemPriceInterface.retailPrice, basketItem.tax.rate));
    basketItem.actualPrice = taxInclusive ? purchasableItemPriceInterface.inclusivePrice : purchasableItemPriceInterface.retailPrice;
    basketItem.quantity = 1;
    basketItem.discount = 0;
    basketItem.finalPrice = basketItem.discount > 0 ?
      this.calcService.calcItemDiscount(
        basketItem.discount,
        basketItem.actualPrice
      ) :
      basketItem.actualPrice;
    basketItem.employeeId = employeeId;
    basketItem.isTaxIncl = taxInclusive;
    basketItem.stockControl = stockControl;

    return basketItem;
  }
}