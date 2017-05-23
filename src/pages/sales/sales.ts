import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { OnInit } from '@angular/core';
import { SalesServices } from '../../services/salesService';
import { TaxService } from '../../services/taxService';
import { CalculatorService } from './../../services/calculatorService';
import { CategoryService } from '../../services/categoryService';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-variables',
  templateUrl: 'sales.html',
  styleUrls: ['/pages/sales/sales.scss'],
  providers: [SalesServices, TaxService, CalculatorService],
})
export class Sales implements OnInit {

  public categories: Array<any>;
  public activeCategory: any;
  public activeTiles: Array<any>;
  public itemsInBucket: Array<any> = [];

  public total: number = 0;
  public tax: number;
  public totalWithTax: number = 0;

  private shownItem: any = null;
  public discount: number = 0;

  public oldValue: number = 1;

  constructor(
      public navCtrl: NavController,
      private salesService: SalesServices,
      private categoryService: CategoryService,
      private alertController: AlertController,
      private taxService: TaxService,
      private calcService: CalculatorService
  ) {
    this.tax = this.taxService.getTax();
  }

  ngOnInit(): void {
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
        error => { throw new Error(error) }
    );
    return category._id == category._id;
  }

  // Event
  public onSelect(item: any) {
    item = this.salesService.prepareBucketItem(item);
    this.itemsInBucket.push(item);
    try {
      let result = this.calcService.calcTotalWithTax(this.total, parseInt(item.price), 'add');
      this.total = result.total;
      this.totalWithTax = result.totalWithTax;
    } catch (e) {
      console.error(e);
    }
  }

  public removeFromBasket(item, $index) {
    try {
      let result = this.calcService.calcTotalWithTax(this.total, parseInt(item.e.quantityPrice), 'subtract');
      this.total = result.total;
      this.totalWithTax != 0 && (this.totalWithTax = result.totalWithTax); 
      this.itemsInBucket.splice($index, 1);
    } catch(e) {
      console.error(e);
    }
  }

  public addQuantity(newValue: string, $index: number) {
    var q: number = parseInt(newValue);
    var item = this.itemsInBucket[$index];
    var price = item.e.discount > 0 ? item.e.discountedPrice : parseInt(item.price);
    if(q > this.oldValue) {
       this.itemsInBucket[$index].e.quantity++;
       this.itemsInBucket[$index].e.quantityPrice += price;
       try {
         let result = this.calcService.calcTotalWithTax(this.total, price, 'add');
         this.total = result.total;
         this.totalWithTax = result.totalWithTax;
       } catch(e) {
         console.error(e);
       }
     } else if (q < this.oldValue) {
       this.itemsInBucket[$index].e.quantity--;
       this.itemsInBucket[$index].e.quantityPrice -= price;
       try {
         let result = this.calcService.calcTotalWithTax(this.total, price, 'subtract');
         this.total = result.total;
         this.totalWithTax = result.totalWithTax;
       } catch(e) {
         console.error(e);
       }
     }
  }

  public calculateDiscount($index: number) {
    if(this.itemsInBucket[$index].e.discount > 0) {
      let discount = this.calcService.calcTotalDiscount(
        this.itemsInBucket[$index].e.discount,
        this.itemsInBucket[$index].price,
        this.itemsInBucket[$index].e.quantity
      );
      try {
        let result = this.calcService.calcTotalWithTax(
          this.total - this.itemsInBucket[$index].e.quantityPrice,
          discount,
          'add'
        );
        this.total = result.total;
        this.totalWithTax = result.totalWithTax;
        this.itemsInBucket[$index].e.quantityPrice = discount;
      } catch (e) {
        console.error(e);
      }
    } else {
      this.total -= this.itemsInBucket[$index].e.quantityPrice;
      this.itemsInBucket[$index].e.quantityPrice = this.itemsInBucket[$index].price;
      for(let i = 2; i <= this.itemsInBucket[$index].e.quantity; i++) {
        this.itemsInBucket[$index].e.quantityPrice += this.itemsInBucket[$index].price;
      }
      try {
        let result = this.calcService.calcTotalWithTax(
          this.total,
          this.itemsInBucket[$index].e.quantityPrice,
          'add'
        );
        this.total = result.total;
        this.totalWithTax = result.totalWithTax;        
      } catch(e) {
        console.error(e);
      }
    }
  }

  public toggleItem(id: string): void {
    this.shownItem = this.isItemShown(id) ? null : id;
  }

  public isItemShown(id: string): boolean {
    return this.shownItem === id;
  }
}