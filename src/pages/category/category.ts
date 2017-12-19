import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, ModalController, Platform, LoadingController } from 'ionic-angular';
import { CategoryService } from '../../services/categoryService';
import { CategoryDetails } from '../category-details/category-details';
import { InventoryModule } from '../../modules/inventoryModule';
import { PageModule } from '../../metadata/pageModule';
import * as _ from 'lodash';

@PageModule(() => InventoryModule)
@Component({
  selector: 'categories',
  templateUrl: 'category.html'
})
export class Category {
  public items = [];
  public itemsBackup = [];
  public isNew = true;
  public action = 'Add';

  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private categoryService: CategoryService,
    private loading: LoadingController,
    private platform: Platform,
    private zone: NgZone,
    private modalCtrl: ModalController) {
  }

  async ionViewDidEnter() {
    try {
      let loader = this.loading.create({ content: 'Loading Categories...' });
      await loader.present();
      let categories: any[] = _.sortBy(await this.categoryService.getAll(), [item => parseInt(item.order) || 0]);
      if (categories.length > 0) {
        let associations: any[] = [];
        categories.forEach((category, index, array) => {
          associations.push(async () => {
            let items = await this.categoryService.getAssociatedItems(category._id);
            array[index].associated = items.length;
            return;
          });
        });

        await Promise.all(associations.map(assoc => assoc()));
        await this.platform.ready();
        this.zone.run(() => {
          this.items = categories;
          this.itemsBackup = categories;
          loader.dismiss();
        });
      } else {
        loader.dismiss();
      }
    } catch (err) {
      console.error(err);
      return;
    }
  }

  showDetail(category) {
    this.navCtrl.push(CategoryDetails, { category: category });
  }

  delete(item, idx) {
    let confirm = this.alertCtrl.create({
      title: 'Confirm Delete Category?',
      message: 'This Category using in Products or Services. Do you want to delete this Category?',
      buttons: [
        {
          text: 'YES',
          handler: () => {
            console.log("Using Category Delete");

            this.categoryService.delete(item).catch(console.error.bind(console));
            this.items.splice(idx, 1);

          }
        },
        {
          text: 'NO',
          handler: () => {

          }
        }
      ]
    });
    confirm.present()
  }

  getItems(event) {
    this.items = this.itemsBackup;
    var val = event.target.value;

    if (val && val.trim() != '') {
      this.items = this.items.filter((category) => {
        return ((category.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
}
