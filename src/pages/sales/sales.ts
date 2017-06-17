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

  constructor(
    public navCtrl: NavController,
    private salesService: SalesServices,
    private categoryService: CategoryService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef,
    private loading: LoadingController,
    private posService: PosService,
    public modalCtrl: ModalController,
    private navParams: NavParams
  ) {
    this.cdr.detach();
  }

  ionViewDidEnter() {
    let loader = this.loading.create({
      content: 'Loading data...',
    });

    loader.present().then(() => {
      var posPromise = new Promise((resolve, reject) => {
        this.posService.setupRegister().then((register: POS) => {
          if (register) {
            this.register = register;
            if (this.register.status) {
              this.initSalePageData().then(() => resolve()).catch((error) => {
                reject(new Error(error));
              });
            } else {
              let openingAmount = this.navParams.get('openingAmount');
              let openingNote = this.navParams.get('openingNotes');
              if(openingAmount) {
                this.initSalePageData().then((response) => {
                  this.register.openTime = new Date().toISOString();
                  this.register.status = true;
                  this.register.openingAmount = Number(openingAmount);
                  this.register.openingNote = openingNote;
                  this.posService.update(this.register);
                  resolve();
                }).catch((error) => {
                  reject(new Error(error));
                });                
              } else {
                resolve();
              }
            }
          } else reject(new Error("Register not found"));
        }).catch((error) => {
          reject(new Error(error));
        });
      });

      posPromise.then(() => {
        this.cdr.reattach();
        loader.dismiss();
      }).catch((error) => {
        throw new Error(error);
      });
    });
  }

  /**
   * Select a category and fetch it's items
   * @param category
   * @returns {boolean}
   */
  public itemSelected(category) {
    this.activeCategory = category;
    this.salesService.loadCategoryItems(category._id).then(
      items => this.activeTiles = items,
      error => { console.error(error); }
    );
    return category._id == category._id;
  }

  // Event
  public onSelect(item: PurchasableItem) {
    this.basketComponent.addItemToBasket(item);
  }

  // Event
  public paymentClicked() {
    this.navCtrl.push(PaymentsPage, {
      invoice: this.invoice
    });
  }
  
  private initSalePageData(): Promise<any> {
    return new Promise((resolve, reject) => {
      var promises: Array<Promise<any>> = [
        new Promise((resolveA, rejectA) => {
          this.posService.getCurrentPosID().then((posId: string) => {
            this.salesService.instantiateInvoice(posId)
              .then((invoice: Sale) => {
                this.invoice = invoice;
                this.invoice = { ...this.invoice };
                resolveA();
              })
              .catch((error) => rejectA(error));
          });
        }),
        new Promise((resolveA, rejectA) => {
          this.categoryService.getAll()
            .then((categories) => {
              this.categories = categories;
              this.activeCategory = this.categories[0];
              this.salesService.loadCategoryItems(this.categories[0]._id).then((items: Array<any>) => {
                this.activeTiles = items;
                resolveA();
              });
            })
            .catch((error) => rejectA(error));
        })
      ];

      Promise.all(promises).then(() => resolve()).catch((error) => reject(error));
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