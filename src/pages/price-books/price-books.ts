import { PriceBookService } from './../../services/priceBookService';
import { PriceBookDetails } from './../price-book-details/price-book-details';
import { NavController, AlertController } from 'ionic-angular';
import { PriceBook } from './../../model/priceBook';
import { Component } from '@angular/core';
import { PageModule } from '../../metadata/pageModule';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import {Utilities} from "../../utility";

@SecurityModule(SecurityAccessRightRepo.PriceBookListing)
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
    private priceBookService: PriceBookService,
    private alertCtrl: AlertController,
    private utility: Utilities
  ) {
    this.date = new Date();
  }

  async ionViewDidEnter() {
    this.priceBooks = await this.priceBookService.getAllSortedByPriority();
    this.priceBooks.forEach(priceBook => {
      priceBook.priority === PriceBookService.MAX_PRIORITY && ((priceBook as any).isDefault = true)
    })
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

  public async delete(priceBook: PriceBook, index) {
    const deleteItem = await this.utility.confirmRemoveItem("Do you really want to delete this Price Book!");
    if(!deleteItem){
        return;
    }
    delete (priceBook as any).isDefault;
    await this.priceBookService.delete(priceBook);
    this.priceBooks.splice(index, 1);
  }

}