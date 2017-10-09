import { PriceBookService } from './../../services/priceBookService';
import { PriceBookDetails } from './../price-book-details/price-book-details';
import { NavController } from 'ionic-angular';
import { PriceBook } from './../../model/priceBook';
import { Component } from '@angular/core';
import { PageModule } from '../../metadata/pageModule';
import { BackOfficeModule } from '../../modules/backOfficeModule';

const MOCK_PRICE_BOOKS: Array<PriceBook> = [
  {
    _id: "1",
    _rev: "1",
    _deleted: false,
    entityTypeName: "PriceBook",
    entityTypeNames: ["DBBasedEntity", "PriceBook"],
    name: "Default Book",
    priority: 0,
    purchasableItems: [],
    criteria: [],
    validFrom: new Date(),
    validTo: new Date(),
    createdAt: new Date()
  },
  {
    _id: "2",
    _rev: "2",
    _deleted: false,
    entityTypeName: "PriceBook",
    entityTypeNames: ["DBBasedEntity", "PriceBook"],
    name: "JaneDoe Book",
    priority: 1,
    purchasableItems: [],
    criteria: [],
    validFrom: new Date(),
    validTo: new Date(),
    createdAt: new Date()    
  }
];

@PageModule(() => BackOfficeModule)
@Component({
  selector: 'price-books',
  templateUrl: 'price-books.html'
})
export class PriceBooksPage {

  public priceBooks: Array<PriceBook>;
  public date: Date;

  private _backup: Array<PriceBook>;

  constructor(
    private navCtrl: NavController,
    private priceBookService: PriceBookService
  ) {
    this.date = new Date();
  }

  async ionViewDidLoad() {
    this.priceBooks = await this.priceBookService.getAll();
    return this.priceBooks;
  }

  public showDetail(priceBook?: PriceBook): void {
    this.navCtrl.push(PriceBookDetails, priceBook ? { priceBook } : null);
  }

  public search($event: any) {
    this.priceBooks = this._backup;
    var val = $event.target.value;

    if (val && val.trim() != '') {
      this.priceBooks = this.priceBooks.filter((item) => {
        return ((item.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

}