import _ from 'lodash';
import { Component } from '@angular/core';
import { LoadingController, ModalController } from 'ionic-angular';
import { CategoryService } from '../../services/categoryService';

import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { PurchasableItem } from '../../model/purchasableItem';
import { SyncContext } from "../../services/SyncContext";
import { Category } from '../../model/category';
import { StoreService } from "../../services/storeService";
import { SecurityAccessRightRepo } from "../../model/securityAccessRightRepo";
import { Utilities } from "../../utility";
import { SortablejsOptions } from "angular-sortablejs";
import { SelectColorModal } from "../../components/color-picker/modal/select-color/select-color";
import { PreferencesModule } from '../../modules/preferencesModule';


@SecurityModule(SecurityAccessRightRepo.PreferencePosPageLayout)
@PageModule(() => PreferencesModule)
@Component({
  selector: 'preferences-pos-page-layout',
  templateUrl: 'preferences-pos-page-layout.html'
})
export class PreferencePosPageLayout {
  public categories: SalesCategory[];
  public activeCategory: SalesCategory;
  public options: SortablejsOptions;

  constructor(
    private categoryService: CategoryService,
    private loading: LoadingController,
    private storeService: StoreService,
    private utils: Utilities,
    private modalCtrl: ModalController,
    private syncContext: SyncContext
  ) {
    this.options = {
      onUpdate: this.onCategoryPositionChange.bind(this)
    };
  }

  async ionViewDidLoad() {
    let loader = this.loading.create({
      content: 'Loading Categories...'
    });
    await loader.present();
    this.syncContext.currentPos.categorySort = this.syncContext.currentPos.categorySort || [];
    this.syncContext.currentPos.productCategorySort = this.syncContext.currentPos.productCategorySort || {};
    this.syncContext.currentPos.categoryColor = this.syncContext.currentPos.categoryColor || {};
    this.syncContext.currentPos.productColor = this.syncContext.currentPos.productColor || {};

    await this.loadCategoriesAndAssociations();
    await loader.dismiss();
  }

  private onCategoryPositionChange(event: any) {
    const sortedCategoryIds = this.categories.map(category => category._id);
    this.syncContext.currentPos.categorySort = sortedCategoryIds;
  }

  public selectCategory(category) {
    this.activeCategory = category;
  }

  public onProductsPositionChange(sortedPurchasableProducts) {
    this.syncContext.currentPos.productCategorySort[this.activeCategory._id] = sortedPurchasableProducts;
  }
  public onProductColorSelected(data) {
    if (!data.color) {
      delete this.syncContext.currentPos.productColor[data.id];
      return;
    }
    this.syncContext.currentPos.productColor[data.id] = data.color;
  }

  private async loadCategoriesAndAssociations() {

    let [categories, purchasableItems] = await Promise.all([this.categoryService.getAll(), this.categoryService.getPurchasableItems()]);

    (<SalesCategory[]>categories).forEach((category, index, catArray) => {
      let items = _.filter(<PurchasableItem[]>purchasableItems, piItem => _.includes(piItem.categoryIDs, category._id));
      if (items.length === 0) {
        category.purchasableItems = [];
      } else {
        category.purchasableItems = items;
        if (this.syncContext.currentPos.productCategorySort && this.syncContext.currentPos.productCategorySort[category._id]) {
          this.utils.sort(category.purchasableItems, this.syncContext.currentPos.productCategorySort[category._id]);
        }
      }
    });

    if (this.syncContext.currentPos.categorySort && this.syncContext.currentPos.categorySort.length) {
      this.utils.sort(categories, this.syncContext.currentPos.categorySort);
    }
    this.categories = <SalesCategory[]>categories;
    this.activeCategory = _.head(this.categories) || new SalesCategory();
  }

  public async save() {
    let loader = this.loading.create({
      content: 'Saving Preferences...'
    });
    await loader.present();
    await this.storeService.updatePOS(this.syncContext.currentPos, this.syncContext.currentStore);
    await loader.dismiss();
  }

  public async selectCategoryColor(categoryId) {
    let modal = this.modalCtrl.create(SelectColorModal);
    modal.onDidDismiss(data => {
      if (data && data.status) {
        if (!data.color) {
          delete this.syncContext.currentPos.categoryColor[categoryId];
          return;
        }
        this.syncContext.currentPos.categoryColor[categoryId] = data.color;
      }
    });
    modal.present();
  }
}

export class SalesCategory extends Category {

  constructor() {
    super();
    this.purchasableItems = [];
  }

  purchasableItems: PurchasableItem[];
}
