import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { SalesServices } from '../../services/salesService';
import { CategoryService } from '../../services/categoryService';
import { AlertController } from 'ionic-angular';

import { BasketComponent } from './../../components/basket/basket.component';

import { Sale } from './../../model/sale';
import { PurchasableItem } from './../../model/purchasableItem';

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


  constructor(
    public navCtrl: NavController,
    private salesService: SalesServices,
    private categoryService: CategoryService,
    private alertController: AlertController,
    private cdr: ChangeDetectorRef
  ) {
    this.cdr.detach();
  }

  ionViewDidEnter() {
    // load categories on the left hand side
    this.categoryService.getAll().then(
      categories => {
        if (categories && categories.length) {
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
      doc => { 
        this.invoice = doc; 
        this.invoice = {...this.invoice};
        this.cdr.reattach(); 
      }
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
    this.basketComponent.addItemToBasket(item);
  }

}