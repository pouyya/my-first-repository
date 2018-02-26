import _ from 'lodash';
import { NgZone } from '@angular/core';
import { DBBasedEntity } from '@simpleidea/simplepos-core/dist/model/dbBasedEntity';
import { BaseEntityService, QuerySelectorInterface, QueryOptionsInterface } from '@simpleidea/simplepos-core/dist/services/baseEntityService';
import { InfiniteScroll } from 'ionic-angular';

export interface FilterQuery {
  [property: string]: any;
}

export class SearchableListing<T extends DBBasedEntity> {

  protected items: T[] = [];
  protected static readonly defaultLimit: number = 10;
  protected static readonly defaultOffset: number = 0;
  protected limit: number;
  protected offset: number;
  protected filter: FilterQuery = {};
  protected options: QueryOptionsInterface = {
    conditionalSelectors: {}
  };

  constructor(
    protected service: BaseEntityService<T>,
    protected zone: NgZone) {
    this.limit = SearchableListing.defaultLimit;
    this.offset = SearchableListing.defaultOffset;
  }

  public async loadData(): Promise<Array<T>> {
    let selectors: QuerySelectorInterface = {};

    if (Object.keys(this.filter).length > 0) {
      _.each(this.filter, (value, key) => {
        selectors[key] = value;
      });
    }

    return await this.service.search(this.limit, this.offset, selectors, this.options);
  }

  public async fetchMore(infiniteScroll?: InfiniteScroll) {
    let data = await this.loadData();
    this.offset += data ? data.length : 0;
    this.zone.run(() => {
      this.items = this.items.concat(data);
      infiniteScroll && infiniteScroll.complete();
    });
  }

}