import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { OnInit } from '@angular/core';
import { SalesServices } from '../../services/salesService';
import { CategoryService } from '../../services/categoryService';

@Component({
  selector: 'page-variables',
  templateUrl: 'sales.html',
  styleUrls: ['/pages/sales/sales.scss'],
  providers: [SalesServices],
})
export class SalesPage implements OnInit {

  public categories: Array<any>;
  public activeCategory: any;
  public activeTiles: Array<any>;

  constructor(
      public navCtrl: NavController,
      private salesService: SalesServices,
      private categoryService: CategoryService
  ) {}

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
}