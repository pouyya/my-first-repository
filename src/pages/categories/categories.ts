import { Component, NgZone } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { CategoryService } from '../../services/categoryService';
import { CategoryDetails } from '../category-details/category-details';
import { InventoryModule } from '../../modules/inventoryModule';
import { PageModule } from '../../metadata/pageModule';
import * as _ from 'lodash';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { Category } from '../../model/category';
import { SortOptions } from '@simpleidea/simplepos-core/dist/services/baseEntityService';
import { SearchableListing } from "../../modules/searchableListing";

@SecurityModule(SecurityAccessRightRepo.InventoryCategory)
@PageModule(() => InventoryModule)
@Component({
  selector: 'categories',
  templateUrl: 'categories.html'
})
export class Categories extends SearchableListing<Category> {
  public items: Category[] = [];

  constructor(public navCtrl: NavController,
    private categoryService: CategoryService,
    private loading: LoadingController,
    protected zone: NgZone) {
    super(categoryService, zone, 'Category');
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

      await this.fetch();
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
}
