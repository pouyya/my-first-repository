import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { OnInit } from '@angular/core';
import { SalesServices } from '../../services/salesService';
import { TaxService } from '../../services/taxService';
import { CategoryService } from '../../services/categoryService';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-variables',
  templateUrl: 'sales.html',
  styleUrls: ['/pages/sales/sales.scss'],
  providers: [SalesServices, TaxService],
})
export class Sales implements OnInit {

  public categories: Array<any>;
  public activeCategory: any;
  public activeTiles: Array<any>;
  public itemsInBucket: Array<any> = [];

  public total: number = 0;
  public tax: number;
  public totalWithTax: number = 0;

  constructor(
      public navCtrl: NavController,
      private salesService: SalesServices,
      private categoryService: CategoryService,
      private alertController: AlertController,
      private taxService: TaxService
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

  removeFromBasket(item, $index) {
    this.total = this.total - item.price;
    this.totalWithTax = this.totalWithTax != 0 ? this.taxService.calculate(this.total) : 0;
    this.itemsInBucket.splice($index, 1);
  }

  // Event 
  onSelect(item: any) {
    this.total = this.total + parseInt(item.price);
    this.totalWithTax = this.taxService.calculate(this.total);

  }
}