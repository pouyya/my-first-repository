import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SalesServices } from '../../services/salesService';
import { TaxService } from '../../services/taxService';
import { CalculatorService } from './../../services/calculatorService';
import { CategoryService } from '../../services/categoryService';
import { AlertController } from 'ionic-angular';

import { Sale } from './../../model/sale';
import { PurchasableItem } from './../../model/purchasableItem';
import { BucketItem } from './../../model/bucketItem';

@Component({
  selector: 'page-variables',
  templateUrl: 'sales.html',
  styleUrls: ['/pages/sales/sales.scss'],
  providers: [SalesServices, TaxService, CalculatorService],
})
export class Sales {

  public categories: Array<any>;
  public activeCategory: any;
  public activeTiles: Array<any>;
  public invoice: Sale;
  public tax: number;
  public oldValue: number = 1;

  private shownItem: any = null;

  constructor(
      public navCtrl: NavController,
      private salesService: SalesServices,
      private categoryService: CategoryService,
      private alertController: AlertController,
      private taxService: TaxService,
      private calcService: CalculatorService,
      private cdr: ChangeDetectorRef
  ) {
    this.cdr.detach();
    this.tax = this.taxService.getTax();
  }

  ionViewDidEnter() {
    // load categories on the left hand side
    this.categoryService.getAll().then(
        categories => {
          if(categories && categories.length) {
            this.categories = categories;
            this.activeCategory = this.categories[0];
            this.salesService.loadCategoryItems(categories[0]._id).then(
                items => this.activeTiles = items,
                error => { throw new Error(error) }
            );
          }
        },
        error => { throw new Error(error) }
    );

    // initiate POS Object
    // if in local storage then load from there otherwise create a new one
    var posId = 'AAD099786746352413F'; // hardcoded POS ID
    this.salesService.instantiateInvoice(posId)
    .then(
      doc => {this.invoice = doc; this.cdr.reattach(); }
    ).catch(console.error.bind(console));
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
    let bucketItem = this.salesService.prepareBucketItem(item);
    this.invoice.items.push(bucketItem);
    let result = this.calcService.calcTotalWithTax(
      this.invoice.subTotal, bucketItem.reducedPrice, 'add');
    this.invoice.subTotal = result.total;
    this.invoice.taxTotal = result.totalWithTax;

    //sync data
    this.salesService.sync(this.invoice).then(
      response => console.log(response)
    ).catch(error => console.error(error));
  }

  public removeItem(item: BucketItem, $index) {
    let result = this.calcService.calcTotalWithTax(this.invoice.subTotal, item.totalPrice, 'subtract');
    this.invoice.subTotal = result.total;
    this.invoice.taxTotal != 0 && (this.invoice.taxTotal = result.totalWithTax);
    this.invoice.items.splice($index, 1);

    // sync data
    this.salesService.sync(this.invoice).then(
      response => console.log(response)
    ).catch(error => console.error(error));
  }

  public aQ(nv: any, item: BucketItem) {
    nv = parseInt(nv);
    var action = 'add';
    if(nv > this.oldValue) {
      item.quantity++;
      item.totalPrice += item.reducedPrice;
    } else if (nv < this.oldValue) {
      item.quantity--;
      item.totalPrice -= item.reducedPrice;
      action = 'subtract';
    }

    let result = this.calcService.calcTotalWithTax(this.invoice.subTotal, item.reducedPrice, action);
    this.invoice.subTotal = result.total;
    this.invoice.taxTotal = result.totalWithTax;   

    // sync data
    this.salesService.sync(this.invoice).then(
      response => console.log(response)
    ).catch(error => console.error(error));
  }

  public calculateDiscount(item: BucketItem) {
    if(item.discount > 0) {
      this.salesService.recalculateOnDiscount(item, this.invoice);
    } else {
      this.invoice.subTotal -= item.totalPrice;
      item.totalPrice = item.actualPrice;
      for(let i = 2; i <= item.quantity; i++) {
        item.totalPrice += item.actualPrice;
      }
      let result = this.calcService.calcTotalWithTax(this.invoice.subTotal, item.totalPrice, 'add');
      this.invoice.subTotal = result.total;
      this.invoice.taxTotal = result.totalWithTax;
    }

    // sync data
    this.salesService.sync(this.invoice).then(
      response => console.log(response)
    ).catch(error => console.error(error));
  }

  public syncInvoice() {
    setTimeout(() => {
      this.salesService.sync(this.invoice).then(
        response => console.log(response)
      ).catch(error => console.error(error));      
    }, 1000);
  }

  public toggleItem(id: string): void {
    this.shownItem = this.isItemShown(id) ? null : id;
  }

  public isItemShown(id: string): boolean {
    return this.shownItem === id;
  }
}