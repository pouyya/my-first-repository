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
import { SortOptions } from '@simplepos/core/dist/services/baseEntityService';
import { SearchableListing } from "../../modules/searchableListing";
import {Utilities} from "../../utility";

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
    protected zone: NgZone,
    private utility: Utilities) {
    super(categoryService, zone, 'Category');
  }

  async ionViewDidEnter() {
    let loader = this.loading.create({ content: 'Loading Categories...' });
    await loader.present();
    try {
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

  private async fetchAssociatedItems(categories){
      let piItems = await this.categoryService.getPurchasableItems();
      categories.forEach((category, index, array) => {
          let items = _.filter(piItems, piItem => piItem.categoryIDs == category._id);
          array[index].associated = items.length;
      });
  }

  public async fetchMore(infiniteScroll?: any) {
    let categories: any = await this.loadData();
    if (categories.length > 0) {
        this.fetchAssociatedItems(categories);
    }
    this.offset += categories ? categories.length : 0;
    this.zone.run(() => {
      this.items = this.items.concat(categories);
      infiniteScroll && infiniteScroll.complete();
    });
  }

  public async delete(item: Category, index: number) {
      try {
          const deleteItem = await this.utility.confirmRemoveItem("Do you really want to delete this category!");
          if(!deleteItem){
              return;
          }
          await super.remove(item, index);
      } catch (err) {
          throw new Error(err);
      }
  }
} 
