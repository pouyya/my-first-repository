import { Platform } from 'ionic-angular';
import { Closure } from './../../model/closure';
import { ClosureService } from './../../services/closureService';
import { Component, NgZone } from '@angular/core';
import { PosService } from '../../services/posService';
import { POS } from '../../model/pos';
import { QuerySelectorInterface, SortOptions, QueryOptionsInterface } from '../../services/baseEntityService';

@Component({
  selector: 'closures',
  templateUrl: 'closures.html',
  styles: [
    `.detail-content {
      
    }`
  ],
})
export class Closures {

  public closures: Closure[] = [];
  public pos: POS = new POS();
  public orderByOptions: any[] = [
    { id: SortOptions.DESC, name: 'Descending' },
    { id: SortOptions.ASC, name: 'Ascending' }
  ];
  public orderBy: SortOptions;
  private readonly defaultLimit = 10;
  private readonly defaultOffset = 0;
  private limit: number;
  private offset: number;
  private total: number;
  private filter: QuerySelectorInterface;
  private shownItem: any = null;

  constructor(
    private platform: Platform,
    private zone: NgZone,
    private posService: PosService,
    private closureService: ClosureService
  ) {
    this.limit;
    this.offset;
    this.total = 0;
    this.orderBy = SortOptions.DESC;
    this.filter = {
      closureNumber: null
    }
  }

  async ionViewDidEnter() {
    try {
      this.limit = this.defaultLimit;
      this.offset = this.defaultOffset;
      this.pos = await this.posService.getCurrentPos();
      await this.platform.ready();
      await this.fetchMore();
    } catch (err) {
      throw new Error(err);
    }
  }

  public toggleItem(closure: Closure): void {
    this.shownItem = this.isItemShown(closure._id) ? null : closure._id;
  }

  public isItemShown(id: string): boolean {
    return this.shownItem === id;
  }

  public async loadClosures(): Promise<Closure[]> {
    let options: QueryOptionsInterface = {
      sort: [{ _id: this.orderBy }],
      conditionalSelectors: {
        posId: this.pos._id
      }
    };
    let closures = await this.closureService.search(this.limit, this.offset, this.filter, options)
    return <Closure[]> closures;
  }

  public async fetchMore(infiniteScroll?: any) {
    let closures = await this.loadClosures();
    this.offset += closures ? closures.length : 0;
    this.zone.run(() => {
      this.closures = this.closures.concat(closures);
      infiniteScroll && infiniteScroll.complete();
    });
  }
}