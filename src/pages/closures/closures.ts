import { Platform, ToastController } from 'ionic-angular';
import { Closure } from './../../model/closure';
import { ClosureService } from './../../services/closureService';
import { Component, NgZone } from '@angular/core';
import { QuerySelectorInterface, SortOptions, QueryOptionsInterface } from '@simpleidea/simplepos-core/dist/services/baseEntityService';
import { PluginService } from '../../services/pluginService';
import { EmployeeService } from '../../services/employeeService';
import { PrintService, EndOfDayReportType } from '../../services/printService';
import { SyncContext } from "../../services/SyncContext";

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
    private closureService: ClosureService,
    private pluginService: PluginService,
    private employeeService: EmployeeService,
    private toastCtrl: ToastController,
    private printService: PrintService,
    private syncContext: SyncContext
  ) {
    this.limit;
    this.offset;
    this.total = 0;
    this.filter = {
      closureNumber: null
    }
  }


  async ionViewCanEnter(): Promise<boolean> {

    let pin = await this.pluginService.openPinPrompt('Enter PIN', 'User Authorization', [],
      { ok: 'OK', cancel: 'Cancel' });
    if (!pin) {
      return false;
    }

    let employee = await this.employeeService.findByPin(pin);

    let toast = this.toastCtrl.create({duration: 3000});

    if (!employee) {
      toast.setMessage('Invalid PIN!');
      toast.present();
      return false;
    }

    if(!employee.isActive) {
      toast.setMessage('Employee not Active!');
      toast.present();
      return false;
    }


    return true;
  }

  async ionViewDidEnter() {
    try {
      this.limit = this.defaultLimit;
      this.offset = this.defaultOffset;
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
      sort: [{ _id: SortOptions.DESC }],
      conditionalSelectors: {
        posId: this.syncContext.currentPos.id
      }
    };
    let closures = await this.closureService.search(this.limit, this.offset, this.filter, options)
    return <Closure[]>closures;
  }

  public async fetchMore(infiniteScroll?: any) {
    let closures = await this.loadClosures();
    this.offset += closures ? closures.length : 0;
    this.zone.run(() => {
      this.closures = this.closures.concat(closures);
      infiniteScroll && infiniteScroll.complete();
    });
  }

  public printClosurePerProductGrouping(closure: Closure) {
    this.printService.printEndOfDayReport(closure, EndOfDayReportType.PerCategory);
  }

  public printClosurePerProduct(closure: Closure) {
    this.printService.printEndOfDayReport(closure,  EndOfDayReportType.PerProduct);
  }

  public printClosurePerEmployee(closure: Closure) {
    this.printService.printEndOfDayReport(closure,  EndOfDayReportType.PerEmployee);
  }
}