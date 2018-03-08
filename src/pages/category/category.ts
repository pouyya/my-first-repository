import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { CategoryService } from '../../services/categoryService';
import { CategoryDetails } from '../category-details/category-details';
import { InventoryModule } from '../../modules/inventoryModule';
import { PageModule } from '../../metadata/pageModule';
import * as _ from 'lodash';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { Category as CategoryModel} from '../../model/Category';
import { QuerySelectorInterface, QueryOptionsInterface, SortOptions } from '@simpleidea/simplepos-core/dist/services/baseEntityService';
import {SearchableListing} from "../../modules/searchableListing";

@SecurityModule(SecurityAccessRightRepo.InventoryCategory)
@PageModule(() => InventoryModule)
@Component({
  selector: 'categories',
  templateUrl: 'category.html'
})
export class Category extends SearchableListing<CategoryModel> {
  public items: CategoryModel[] = [];
  // public itemsBackup = [];
  // private readonly defaultLimit = 10;
  // private readonly defaultOffset = 0;
  // private limit: number;
  // private offset: number;
  // private filter: any = {};

  constructor(public navCtrl: NavController,
    private alertCtrl: AlertController,
    private categoryService: CategoryService,
    private loading: LoadingController,
    protected zone: NgZone) {

    super(categoryService, zone, 'Category');
    // this.limit = this.defaultLimit;
    // this.offset = this.defaultOffset;
  }

  async ionViewDidEnter() {
    let loader = this.loading.create({ content: 'Loading Categories...' });
    await loader.present();
    try {
      this.options = {
          sort: [
              { order: SortOptions.ASC }
          ],
          conditionalSelectors: {
              order: {
                  $gt: true
              }
          }
      }
      await this.fetchMore();
      loader.dismiss();
    } catch (err) {
      console.error(new Error(err));
      loader.dismiss();
      return;
    }
  }

  showDetail(category) {
    this.navCtrl.push(CategoryDetails, { category: category });
  }

  /*delete(category: any, idx) {
    let confirm = this.alertCtrl.create({
      title: 'Confirm Delete Category?',
      message: 'This Category using in Products or Services. Do you want to delete this Category?',
      buttons: [
        {
          text: 'YES',
          handler: () => {
            this.categoryService.delete(category).catch(console.error.bind(console));
            this.items.splice(idx, 1);
          }
        },
        'NO'
      ]
    });
    confirm.present()
  }

  private async loadCategories(): Promise<any> {
    let selectors: QuerySelectorInterface = { };

    if (Object.keys(this.filter).length > 0) {
      _.each(this.filter, (value, key) => {
        if (value) {
          selectors[key] = value;
        }
      });
    }

    let options: QueryOptionsInterface = {
      sort: [
        { order: SortOptions.ASC }
      ],
      conditionalSelectors: {
        order: {
          $gt: true
        }
      }
    }
    return await this.categoryService.search(this.limit, this.offset, selectors, options);
  }*/

  public async fetchMore(infiniteScroll?: any) {
    let categories: any = await this.loadData();
    if (categories.length > 0) {
      let piItems = await this.categoryService.getPurchasableItems();
      categories.forEach((category, index, array) => {
        let items = _.filter(piItems, piItem => piItem.categoryIDs == category._id)
        array[index].associated = items.length;
      });
    }
    this.offset += categories ? categories.length : 0;
    this.zone.run(() => {
      this.items = this.items.concat(categories);
      infiniteScroll && infiniteScroll.complete();
    });
  }

 /* public async searchByName(event) {
    let val = event.target.value;
    this.filter['name'] = (val && val.trim() != '') ? val : "";
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.items = [];
    await this.fetchMore();
  }*/
}
