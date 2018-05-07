import _ from 'lodash';
import { NgZone } from '@angular/core';
import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';
import { BaseEntityService, QuerySelectorInterface, QueryOptionsInterface } from '@simpleidea/simplepos-core/dist/services/baseEntityService';
import { InfiniteScroll } from 'ionic-angular';
import { ListingInfo, Item, FilterType } from "../metadata/listingModule";

export interface FilterQuery {
  [property: string]: any;
}

export class SearchableListing<T extends DBBasedEntity> {
  private type: string;
  protected items: T[] = [];
  protected defaultLimit: number = 10;
  protected defaultOffset: number = 0;
  protected limit: number;
  protected offset: number;
  protected displayColumns: Item[];
  protected searchFilters: Item[] = [];
  protected filter: FilterQuery = {};
  protected models: {};
  protected options: QueryOptionsInterface = {
    conditionalSelectors: {}
  };

  constructor(
    protected service: BaseEntityService<T>,
    protected zone: NgZone, type: string) {
    this.models = {};
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.type = type;
    this.initData();
  }

  private initData(){
    this.displayColumns = ListingInfo.getDisplayList( this.type );
    this.searchFilters = ListingInfo.getFilterList( this.type );
  }

  protected setDefaultSettings(){
    this.limit = this.defaultLimit;
    this.offset = this.defaultOffset;
    this.items = [];
  }

  protected async loadData(): Promise<Array<T>> {
    let selectors: QuerySelectorInterface = {};

    if (Object.keys(this.filter).length > 0) {
      _.each(this.filter, (value, key) => {
        selectors[key] = value;
      });
    }

    return await this.service.search(this.limit, this.offset, selectors, this.options);
  }

  protected async fetch() {
    this.setDefaultSettings();
    await this.fetchMore();
  }

  protected async fetchMore(infiniteScroll?: InfiniteScroll) {
    let data = await this.loadData();
    this.offset += data ? data.length : 0;
    this.zone.run(() => {
      this.items = this.items.concat(data);
      infiniteScroll && infiniteScroll.complete();
    });
  }
  
  protected async filterList(filterItem: Item, value){
    if(filterItem.type === FilterType.Boolean){
      if(value){
        this.options.conditionalSelectors[filterItem.variableName] = (value == 'true' || value == true);
      }else{
        delete this.options.conditionalSelectors[filterItem.variableName];
      }
    }
    this.setDefaultSettings();
    await this.fetchMore();
  }

  protected async searchByText(filterItem: Item, value){
    this.filter[filterItem.variableName] = (value && value.trim() != '') ? value : "";
    this.setDefaultSettings();
    await this.fetchMore();
  }

  protected async remove(item: T, index) {
    try {
      await this.service.delete(item);
      this.items.splice(index, 1);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}