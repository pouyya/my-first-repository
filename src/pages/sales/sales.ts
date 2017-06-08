import { SalesModule } from "../../modules/salesModule";
import { PageModule } from './../../metadata/pageModule';
import { ParkSale } from './modals/park-sale';
import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import { NavController, AlertController, LoadingController, ModalController } from 'ionic-angular';
import { SalesServices } from '../../services/salesService';
import { CategoryService } from '../../services/categoryService';

import { BasketComponent } from './../../components/basket/basket.component';

import { Sale } from './../../model/sale';
import { PurchasableItem } from './../../model/purchasableItem';
import { PosService } from "../../services/posService";
import { PaymentsPage } from "../payment/payment";


@PageModule(() => SalesModule)
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
    private cdr: ChangeDetectorRef,
    private loading: LoadingController,
    private posService: PosService,
    public modalCtrl: ModalController
  ) {
    this.cdr.detach();
  }

  ionViewDidEnter() {
    let loader = this.loading.create({
      content: 'Loading data...',
    });

    loader.present().then(() => {
      // load categories on the left hand side
      var categoryPromise = this.categoryService.getAll().then(
        categories => {
          if (categories && categories.length) {
            this.categories = categories;
            this.activeCategory = this.categories[0];
            return this.salesService.loadCategoryItems(categories[0]._id).then(
              items => this.activeTiles = items,
              error => {
                throw new Error(error)
              }
            );
          }
        },
        error => {
          throw new Error(error)
        }
      );

      // initiate POS Object
      // if in local storage then load from there otherwise create a new one
      var salesPromise = this.salesService.instantiateInvoice(this.posService.getCurrentPosID())
        .then(
        doc => {
          this.invoice = doc;
          this.invoice = { ...this.invoice };
          this.cdr.reattach();
        }
        ).catch(console.error.bind(console));

      Promise.all([categoryPromise, salesPromise]).then(function () {
        loader.dismiss();
      });

    });
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

  // Event
  public paymentClicked() {
    this.navCtrl.push(PaymentsPage, {
      invoice: this.invoice
    });
  }

  public parkSale() {
    let modal = this.modalCtrl.create(ParkSale, { invoice: this.invoice });
    modal.onDidDismiss(data => {
      if (data.status) {
        // clear invoice
        localStorage.removeItem('pos_id');
        let confirm = this.alertController.create({
          title: 'Invoice Parked!',
          subTitle: 'Your invoice has successfully been parked',
          buttons: [
            {
              'text': 'OK',
              handler: () => {
                this.navCtrl.setRoot(this.navCtrl.getActive().component);
              }
            }
          ]
        });
        confirm.present();
      } else if(data.error) {
        let error = this.alertController.create({ 
          title: 'ERROR', 
          message: data.error || 'An error has occurred :(', 
          buttons: ['OK']
        });
        error.present();
      }
    });
    modal.present();
  }

  public discardSale() {
    let confirm = this.alertController.create({
      title: 'Discard Sale',
      message: 'Do you wish to discard this sale ?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.salesService.delete(this.invoice).then(() => {
              localStorage.removeItem('pos_id');
              this.navCtrl.setRoot(this.navCtrl.getActive().component);
            }).catch((error) => console.log(new Error()));

          }
        },        
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        }
      ]
    });
    confirm.present();
  }
}