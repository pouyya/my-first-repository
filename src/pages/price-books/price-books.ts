import { PriceBook } from './../../model/priceBook';
import { Component } from '@angular/core';

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
    criteria: []
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
    criteria: []
  }
];

@Component({
  selector: 'price-books',
  templateUrl: 'price-books.html'
})
export class PriceBooksPage {

  public priceBooks: Array<PriceBook>;
  public date: Date;

  private _backup: Array<PriceBook>;

  constructor() {
    this.priceBooks = MOCK_PRICE_BOOKS;
    this.date = new Date();
  }

  public add() {

  }

  public showDetails() {
    
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