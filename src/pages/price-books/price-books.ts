import { PriceBookService } from './../../services/priceBookService';
import { PriceBookDetails } from './../price-book-details/price-book-details';
import { NavController, AlertController } from 'ionic-angular';
import { PriceBook } from './../../model/priceBook';
import { Component } from '@angular/core';
import { PageModule } from '../../metadata/pageModule';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';

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
    private alertCtrl: AlertController
  ) {
    this.date = new Date();
  }

  async ionViewDidEnter() {
    this.priceBooks = await this.priceBookService.getAllSortedByPriority();
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

  public delete(priceBook: PriceBook, index) {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete this Price Book ?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.priceBookService.delete(priceBook)
              .then(() => {
                this.priceBooks.splice(index, 1);
              })
              .catch(error => {
                throw new Error(error);
              })
          }
        }, 'No'
      ]
    });

    confirm.present();
  }

}