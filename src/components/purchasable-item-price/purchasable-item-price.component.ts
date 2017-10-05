import { SalesTax } from './../../model/salesTax';
import { SalesTaxService } from './../../services/salesTaxService';
import { PriceBookService } from './../../services/priceBookService';
import { PriceBook } from './../../model/priceBook';
import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'purchasable-item-price',
  templateUrl: 'purchasable-item-price.html',
  styleUrls: []
})
export class PurchasableItemPriceComponent implements OnChanges {

  public _priceBook: PriceBook;
  public items: object[] = [];

  @Input("priceBook")
  set priceBook(value: PriceBook) {
    this._priceBook = value;
  }
  get priceBook() {
    return this._priceBook;
  }
  @Input() salesTaxes?: any[];

  constructor(
    private priceBookService: PriceBookService,
    private salesTaxService: SalesTaxService
  ) {

  }

  ngOnChanges() {
    if (this._priceBook && this._priceBook._id && this._priceBook.purchasableItems.length > 0) {
      let promises: Promise<any>[] = [
        // fetch purchasableitems
        new Promise((resolve, reject) => {
          let fetchItems: Promise<any>[] = [];
          let items: any[] = [];
          this._priceBook.purchasableItems.forEach(item => {
            fetchItems.push(new Promise((res, rej) => {
              this.priceBookService.get(item.id).then(model => {
                items.push({
                  name: model.name,
                  entityTypeName: model.entityTypeName,
                  ...item
                });
                res();
              }).catch(error => res());
            }));
          });

          Promise.all(fetchItems).then(() => {
            resolve(items)
          }).catch(error => reject(error));
        })
      ];

      if (!this.salesTaxes || this.salesTaxes.length == 0) {
        promises.push(this.salesTaxService.getAll());
      }

      Promise.all(promises).then((results: any[]) => {
        this.items = results[0]
        if (results[1]) this.salesTaxes = results[1];
      }).catch(error => {
        throw new Error(error);
      });

    }

  }

  public calculate() {

  }

}