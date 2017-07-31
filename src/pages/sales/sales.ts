import _ from 'lodash';
import { AppSettingsService } from './../../services/appSettingsService';
import { SalesTax } from './../../model/salesTax';
import { SalesTaxService } from './../../services/salesTaxService';
import { PriceBookService } from './../../services/priceBookService';
import { PriceBook } from './../../model/priceBook';
import { POS } from './../../model/pos';
import { SalesModule } from "../../modules/salesModule";
import { PageModule } from './../../metadata/pageModule';
import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NavController, AlertController, LoadingController, ModalController, NavParams } from 'ionic-angular';
import { SalesServices } from '../../services/salesService';
import { CategoryService } from '../../services/categoryService';
import { BasketComponent } from './../../components/basket/basket.component';
import { Sale } from './../../model/sale';
import { PurchasableItem } from './../../model/purchasableItem';
import { PosService } from "../../services/posService";
import { PaymentsPage } from "../payment/payment";
import { UserService } from './../../services/userService';


@PageModule(() => SalesModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'sales.html',
  styleUrls: ['/pages/sales/sales.scss'],
  providers: [SalesServices],
})
export class Sales {

  @ViewChild(BasketComponent)
  private basketComponent: BasketComponent;

  public categories: Array<any>;
  public activeCategory: any;
  public activeTiles: Array<any>;
  public invoice: Sale;
  public register: POS;
  public doRefund: boolean = false;
  public icons: any;
  private invoiceParam: any;
  private priceBook: PriceBook;
  private salesTaxes: Array<SalesTax>;
  private user: any;

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private salesService: SalesServices,
    private categoryService: CategoryService,
    private priceBookService: PriceBookService,
    private salesTaxService: SalesTaxService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef,
    private loading: LoadingController,
    private posService: PosService,
    private navParams: NavParams,
    private userService: UserService,
    private appSettingsService: AppSettingsService
  ) {
    this.invoiceParam = this.navParams.get('invoice');
    this.doRefund = this.navParams.get('doRefund');
    this.user = this.userService.getLoggedInUser();
    this.register = this.user.currentPos;
    this.cdr.detach();
  }

  ionViewDidLoad() {

    let _init: boolean = false;
    if (!this.register.status) {
      let openingAmount: number = Number(this.navParams.get('openingAmount'));
      let openingNote: string = this.navParams.get('openingNotes');
      if (openingAmount && openingAmount > 0) {
        this.register.openTime = new Date().toISOString();
        this.register.status = true;
        this.register.openingAmount = Number(openingAmount);
        this.register.openingNote = openingNote;
        this.posService.update(this.register);
        _init = true;
      }
    } else {
      _init = true;
    }

    if (_init) {
      // load in parallel
      this.categoryService.getAll().then((categories) => {
        this.categories = categories;
        this.loadCategoriesAssociation(categories);
      });

      let loader = this.loading.create({
        content: 'Loading Register...',
      });

      loader.present().then(() => {
        this.initSalePageData().then(() => {
         this.cdr.reattach();
          loader.dismiss();
        })
      });
    }
  }

  /**
   * Select a category and fetch it's items
   * @param category
   * @returns {boolean}
   */
  public itemSelected(category) {
    this.activeCategory = category;
    this.salesService.loadPurchasableItems(category._id).then(
      items => {
        this.activeTiles = items;
      },
      error => { console.error(error); }
    );
    return category._id == category._id;
  }

  // Event
  public onSelect(item: PurchasableItem) {
    let interactableItem: any = { ...item, tax: null, priceBook: null };
    interactableItem.priceBook = _.find(this.priceBook.purchasableItems, { id: item._id }) as any;
    interactableItem.priceBook.salesTaxId != null && (interactableItem.tax = _.find(this.salesTaxes, { _id: interactableItem.priceBook.salesTaxId }));
    this.basketComponent.addItemToBasket(interactableItem);
  }

  // Event
  public paymentClicked($event) {
    var pushCallback = (_params) => {
      return new Promise((resolve, reject) => {
        if (_params) {
          this.invoiceParam = null;
        }
        resolve();
      });
    }

    this.doRefund = $event.balance < 0;
    this.navCtrl.push(PaymentsPage, {
      invoice: this.invoice,
      doRefund: this.doRefund,
      callback: pushCallback
    });
  }

  private initSalePageData(): Promise<any> {
    return new Promise((res, rej) => {
      this.salesService.initializeSalesData(this.invoiceParam).subscribe((data: any) => {
        this.invoice = data[0] as Sale;
        this.salesTaxes = data[1] as Array<any>;
        this.priceBook = data[2] as PriceBook;
        res();
      }, error => rej(error));
    });
  }

  private loadCategoriesAssociation(categories: Array<any>) {
    return new Promise((resolve, reject) => {
      var promiseCategories = new Array<Promise<any>>();
      for (var categoryIndex = categories.length - 1; categoryIndex >= 0; categoryIndex--) {
        promiseCategories.push(new Promise((resolveB, rejectB) => {
          if (categoryIndex === 0) {
            this.activeCategory = categories[categoryIndex];
            this.salesService.loadPurchasableItems(categories[categoryIndex]._id).then((items: Array<any>) => {
              this.activeTiles = items;
              resolveB();
            });
          }
          else {
            this.salesService.loadPurchasableItems(categories[categoryIndex]._id).then(() => {
              resolveB();
            });
          }
        }));
      }

      Promise.all(promiseCategories).then(() => resolve());
    });
  }

  public onSubmit() {
    this.initSalePageData().then((response) => {
      this.register.openTime = new Date().toISOString();
      this.register.status = true;
      this.register.openingAmount = Number(this.register.openingAmount);
      this.posService.update(this.register);
    }).catch((error) => {
      throw new Error(error);
    });
  }
}