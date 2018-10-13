import _ from 'lodash';
import { DiscountSurchargeModal } from './modals/discount-surcharge/discount-surcharge';
import { GroupByPipe } from './../../pipes/group-by.pipe';
import { Component, EventEmitter, Input, Output, NgZone } from '@angular/core';
import {
  AlertController, ModalController, ToastController, NavController, Modal,
  LoadingController
} from 'ionic-angular';
import { ParkSale } from './../../pages/sales/modals/park-sale';
import { SalesServices } from './../../services/salesService';
import { Sale, DiscountSurchargeInterface, DiscountSurchargeTypes, SaleType } from './../../model/sale';
import { BasketItem } from './../../model/basketItem';
import { GlobalConstants } from './../../metadata/globalConstants';
import { ItemInfoModal } from './item-info-modal/item-info';
import { Customer } from '../../model/customer';
import { CreateCustomerModal } from './modals/create-customer/create-customer';
import { CustomerService } from '../../services/customerService';
import { BaseTaxIterface } from '../../model/baseTaxIterface';
import { PriceBook } from '../../model/priceBook';
import { PriceBookService } from '../../services/priceBookService';
import { EvaluationContext } from '../../services/EvaluationContext';
import { PurchasableItemPriceInterface } from '../../model/purchasableItemPrice.interface';
import { PurchasableItem } from '../../model/purchasableItem';
import { PaymentService } from '../../services/paymentService';
import { UserSession } from '../../modules/dataSync/model/UserSession';
import { PrintService } from './../../services/printService';
import { PaymentsPage } from './../../pages/payment/payment';
import { SyncContext } from "../../services/SyncContext";
import { ProductService } from "../../services/productService";
import { AddNotes } from "./modals/add-notes/add-notes";
import { TableArrangementService } from "../../services/tableArrangementService";
import { TableStatus } from "../../model/tableArrangement";

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
  public totalExternalValue: number = 0;
  private salesTaxes: BaseTaxIterface[];
  private defaultTax: BaseTaxIterface;
  private priceBooks: PriceBook[];
  private sale: Sale;
  private selectedItem;
  private evaluationContext: EvaluationContext;
  private baseDataLoaded: boolean = false;
  private isSaleParked: boolean = false;
  private tables;
  private table;
  private get refund(): boolean {
    return this.balance < 0
  }

  @Input() user: UserSession;

  @Input('employees')
  set employee(arr: Array<any>) {
    this.employeesHash = _.keyBy(arr, '_id');
  }

  @Output() paymentCompleted = new EventEmitter<any>();
  @Output() saleParked = new EventEmitter<any>();
  @Output() onAttachCustomer = new EventEmitter<any>();
  constructor(
    private salesService: SalesServices,
    private alertController: AlertController,
    private groupByPipe: GroupByPipe,
    private customerService: CustomerService,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private priceBookService: PriceBookService,
    private printService: PrintService,
    private paymentService: PaymentService,
    private navCtrl: NavController,
    private loading: LoadingController,
    private syncContext: SyncContext,
    private productService: ProductService,
    private tableArrangementService: TableArrangementService,
    private ngZone: NgZone) {
  }

  public async initializeSale(sale: Sale, evaluationContext: EvaluationContext) {

    if (!this.baseDataLoaded) {
      await this.loadBaseData();
      this.baseDataLoaded = true;
    }

    this.evaluationContext = evaluationContext;
    const allTables = await this.tableArrangementService.getStoreTables();
    this.tables = allTables.reduce((initObj, data) => {
      initObj[data.id] = data;
      return initObj;
    }, {});

    if (!sale) {
      sale = await this.salesService.instantiateSale()
    } else if (sale && sale.state == 'current') {
      await this.recalculateSaleAmounts(sale);
      sale = await this.salesService.update(sale);
    }
    let customer: Customer = null;

    if (sale.customerKey) {
      customer = await this.customerService.get(sale.customerKey);
    }

    this.sale = sale;
    this.sale.tableId && this.attachTable(this.sale.tableId);
    this.isSaleParked = this.sale.state === 'parked';
    this.customer = customer || null;
    if (this.sale.attachedCustomerName) {
      this.onAttachCustomer.emit({ isAttached: true, customerName: this.sale.attachedCustomerName });
    }
    this.setBalance();
    this.sale.completed = false;
    this.generatePaymentBtnText();
    this.calculateTotalExternalValues();
    this.sale.items.some((item: any) => {
      if (item.isSelected) {
        this.selectItem(item);
        return true;
      }
    });
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
    [this.salesTaxes, this.defaultTax, this.priceBooks] =
      [await this.salesService.getSaleTaxs(),
      await this.salesService.getDefaultTax(),
      await this.priceBookService.getAllSortedByPriority()]
  }

  setBalance() {
    this.balance = this.sale.payments && this.sale.payments.length > 0 ?
      this.sale.taxTotal - this.sale.payments
        .map(payment => payment.amount)
        .reduce((a, b) => a + b) : this.sale.taxTotal;
    this.sale.state = this.balance > 0 ? 'current' : 'refund';
  }

  public async addItemToBasket(purchasableItem: PurchasableItem, categoryId: string, currentEmployeeId: string, stockControl: boolean) {
    if (!this.sale) {
      return;
    }

    const isFirstModifier = !this.sale.items.length && purchasableItem.isModifier;
    if (!isFirstModifier) {
      let itemPrice = await this.priceBookService.getEligibleItemPrice(this.evaluationContext, this.priceBooks, purchasableItem._id);
      if (itemPrice) {
        var basketItem = this.createBasketItem(purchasableItem, categoryId, this.user.settings.taxType, itemPrice, currentEmployeeId, stockControl);
        if (purchasableItem.isModifier) {
          const item = this.selectedItem || this.sale.items[this.sale.items.length - 1];
          !item.modifierItems && (item.modifierItems = []);
          this.updateQuantity(basketItem, item.modifierItems);
        } else {
          this.updateQuantity(basketItem);
        }
        this.sale.items = this.groupByPipe.transform(this.sale.items, 'employeeId');
        this.calculateAndSync();
        this.scrollIntoView(basketItem.purchsableItemId);
      } else {
        let toast = this.toastCtrl.create({
          message: `${purchasableItem.name} does not have any price`,
          duration: 3000
        });
        await toast.present();
      }
    } else {
      let toast = this.toastCtrl.create({
        message: `${purchasableItem.name} is a modifier and cannot be added directly`,
        duration: 3000
      });
      await toast.present();
    }
  }


  private updateQuantity(basketItem: BasketItem, items?: [BasketItem]) {
    const saleItems = items || this.sale.items;
    var index = _.findIndex(saleItems, (currentSaleItem: BasketItem) => {
      return (currentSaleItem.purchsableItemId == basketItem.purchsableItemId &&
        currentSaleItem.finalPrice == basketItem.finalPrice &&
        currentSaleItem.employeeId == basketItem.employeeId && (!currentSaleItem.modifierItems || !currentSaleItem.modifierItems.length));
    });
    let item;
    if (index !== -1) {
      item = saleItems[index];
      item.quantity++;
    } else {
      item = basketItem;
      saleItems.push(item);
    }
    !items && this.selectItem(item);
  }

  private scrollIntoView(purchsableItemId: string) {
    setTimeout(() => {
      document.getElementById(purchsableItemId).scrollIntoView();
    }, 0);
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

  private selectItem(item: BasketItem) {
    this.selectedItem && delete this.selectedItem.isSelected;
    this.selectedItem = item;
    this.selectedItem.isSelected = true;
  }

  public viewInfo(item: BasketItem, $index) {
    this.selectItem(item);

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

  private calculateTotalExternalValues() {
    let taxTotal = this.salesService.getTaxTotalSaleValue(this.sale);
    this.totalExternalValue = this.sale.appliedValues.reduce((initialVal, nextVal: DiscountSurchargeInterface) => {
      let value = nextVal.value;
      if (nextVal.format === 'percentage') {
        value = taxTotal * value / 100;
      }

      if (nextVal.type === DiscountSurchargeTypes.Surcharge) {
        initialVal += value;
      } else {
        initialVal -= value;
      }
      return initialVal;
    }, 0);

    this.totalExternalValue -= this.sale.items.reduce((initialVal, item) => {
      if (item.discount) {
        initialVal += item.quantity * (item.systemPrice * item.discount / 100);
      }
      return initialVal;
    }, 0)
  }

  public externalValue(): { applyDiscount: Function, applySurcharge: Function } {
    let modal: Modal;
    let modalOptions: any = { values: this.sale.appliedValues }
    let onDismiss = ((response: { values: DiscountSurchargeInterface[], data: DiscountSurchargeInterface }) => {
      if (response) {
        this.sale.appliedValues = response.values;
        response.data && this.sale.appliedValues.push(response.data);
        this.calculateAndSync();
      }
    });

    let exec = (action) => {
      modalOptions.action = action;
      modalOptions.total = this.balance;
      modal = this.modalCtrl.create(DiscountSurchargeModal, modalOptions);
      modal.onDidDismiss(onDismiss);
      modal.present();
    }

    return {
      applyDiscount: () => exec('discount'),
      applySurcharge: () => exec('surcharge')
    }
  }

  public gotoPayment() {
    let pushCallback = async params => {
      if (params) {
        this.isSaleParked && this.saleParked.emit(false);
        this.isSaleParked = false;
        await this.unassignTable();
        this.unattachCustomer();
        this.sale = await this.salesService.instantiateSale();
        this.paymentCompleted.emit();
        this.customer = null;
      }
      this.calculateAndSync();
    }

    this.initializeSearchBar();

    this.navCtrl.push(PaymentsPage, {
      sale: this.sale,
      doRefund: this.refund,
      callback: pushCallback
    });
  }

  private initializeSearchBar() {
    this.searchBarEnabled = true;
    this.searchedCustomers = [];
    this.searchInput = "";
  }

  public async fastPayment() {
    const stockEnabledItems = this.productService.getStockEnabledItems(this.sale.items);
    if (stockEnabledItems.length) {

      let loader = this.loading.create({ content: 'Checking Stocks...' });
      await loader.present();

      var stockErrors = await this.salesService.checkForStockInHand(stockEnabledItems, this.syncContext.currentStore._id);
      loader.dismiss();

      if (stockErrors && stockErrors.length > 0) {
        let alert = this.alertController.create(
          {
            title: 'Out of Stock',
            subTitle: 'Please make changes to sale and continue',
            message: `${stockErrors.join('\n')}`,
            buttons: ['Ok'],
          }
        );
        alert.present();
        return;
      }
    }

    this.initializeSearchBar();

    this.ngZone.runOutsideAngular(async () => {
      let sale = { ...this.sale }

      sale.payments = [
        {
          type: 'cash',
          amount: Number(sale.items.length > 0 ? _.sumBy(sale.items, item => item.finalPrice * item.quantity) : 0)
        }
      ];

      await this.paymentService.completePayment(sale, this.syncContext.currentStore._id, this.refund);

      await this.salesService.update(sale);

      setTimeout(async () => {
        try { await this.printSale(false, sale); } catch (error) { console.log(error); }
        try { await this.printService.printProductionLinePrinter(sale); } catch (error) { console.log(error); }
      }, 0);

    });

    localStorage.removeItem('sale_id');
    await this.unassignTable();
    this.unattachCustomer();
    this.sale = await this.salesService.instantiateSale(this.syncContext.currentPos.id);
    this.paymentCompleted.emit();
    this.isSaleParked && this.saleParked.emit(false);
    this.isSaleParked = false;
    this.customer = null;
    this.calculateAndSync();
  }

  private async printSale(forcePrint: boolean, sale: Sale) {
    if (this.syncContext.currentStore.printReceiptAtEndOfSale || forcePrint) {
      await this.printService.printReceipt(sale, true);
    } else {
      await this.printService.openCashDrawer();
    }
  }

  private generatePaymentBtnText() {
    this.payBtnText = GlobalConstants.PAY_BTN;
    if (this.sale.items && this.sale.items.length > 0) {
      this.disablePaymentBtn = false;
      if (this.balance == 0) {
        this.payBtnText = GlobalConstants.DONE_BTN;
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
        if (!this.isSaleParked) {
          this.saleParked.emit(true);
        }
        if (this.sale.tableId) {
          const table = this.tables[this.sale.tableId];
          table.status = TableStatus.Active;
          this.tableArrangementService.updateTable(table, null);
        }
        let confirm = this.alertController.create({
          title: 'Sale Parked!',
          subTitle: 'Your sale has successfully been parked',
          buttons: [
            {
              'text': 'OK',
              handler: () => {
                this.isSaleParked = false;
                this.salesService.instantiateSale().then((sale: any) => {
                  this.customer = null;
                  this.table = null;
                  this.sale = sale;
                  this.calculateAndSync();
                  this.initializeSearchBar();
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
              if (this.sale.tableId) {
                const table = this.tables[this.sale.tableId];
                table.status = TableStatus.Closed;
                table.numberOfGuests = 0;
                this.tableArrangementService.updateTable(table, null);
              }
              this.unattachCustomer();
              this.isSaleParked && this.saleParked.emit(false);
              this.isSaleParked = false;
              localStorage.removeItem('sale_id');
              this.customer = null;
              this.sale = await this.salesService.instantiateSale();
              this.calculateAndSync();
              this.initializeSearchBar();
            });
          }
        },
        { text: 'No' }
      ]
    });
    confirm.present();
  }

  public addNote() {
    let modal = this.modalCtrl.create(AddNotes, { notes: this.sale.notes || '' });
    modal.onDidDismiss(notes => {
      if (notes) {
        this.sale.notes = notes;
      }
    });
    modal.present();
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
    this.onAttachCustomer.emit({ isAttached: true, customerName: this.customer.fullname });
  }

  public async unassignCustomer() {
    this.customer = null;
    this.sale.customerKey = null;
    await this.salesService.update(this.sale);
    this.salesService.manageSaleId(this.sale);
    this.searchBarEnabled = true;
    if (this.sale.attachedCustomerName) {
      this.unattachCustomer();
    }
  }

  public createCustomer() {
    let modal = this.modalCtrl.create(CreateCustomerModal, {
      searchInput: this.searchInput
    });
    modal.onDidDismiss(customer => {
      if (customer) {
        this.customer = customer;
        this.onAttachCustomer.emit({ isAttached: true, customerName: this.customer.fullname });
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
        this.onAttachCustomer.emit({ isAttached: true, customerName: this.customer.fullname });
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
    this.calculateTotalExternalValues();
  }


  private createBasketItem(purchasableItem: PurchasableItem, categoryId: string, isTaxIncl: boolean, itemPrice: PurchasableItemPriceInterface, employeeId: string, stockControl: boolean): BasketItem {
    let basketItem = new BasketItem();
    basketItem.quantity = 1;
    basketItem.discount = 0;
    basketItem.purchsableItemId = purchasableItem._id;
    basketItem.name = purchasableItem.name;
    basketItem.categoryId = categoryId;
    basketItem.employeeId = employeeId;
    basketItem.stockControl = stockControl;
    basketItem.isBumped = false;

    this.salesService.calculateAndSetBasketPriceAndTax(basketItem, this.salesTaxes, this.defaultTax, itemPrice, isTaxIncl);
    return basketItem;
  }


  public attachTable(tableId) {
    this.table = this.tables[tableId];
    if (this.sale) {
      this.sale.tableId = tableId;
      this.sale.tableName = this.table.name;
      this.sale.type = SaleType.DineIn;
      this.unattachCustomer();
      if (this.table.status !== TableStatus.Active && this.sale.items.length) {
        this.parkSale();
      }
    }
  }

  public async unassignTable() {
    if (this.sale) {
      delete this.sale.tableId;
      delete this.sale.tableName;
      delete this.sale.type;
      if (this.table) {
        this.table.status = TableStatus.Closed;
        this.table.numberOfGuests = 0;
        await this.tableArrangementService.updateTable(this.table, null, null);
      }
    }
    this.table = null;
  }


  public attachCustomer(customerName: string) {
    if (this.sale) {
      this.sale.attachedCustomerName = customerName;
      this.sale.type = SaleType.TakeAway;
      delete this.sale.tableId;
      delete this.sale.tableName;
      this.onAttachCustomer.emit({ isAttached: true, customerName });
    }
  }

  public unattachCustomer() {
    if (this.sale) {
      delete this.sale.attachedCustomerName;
      this.onAttachCustomer.emit({ isAttached: false });
    }
  }

}