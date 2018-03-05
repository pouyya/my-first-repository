import { EmployeeService } from './../../services/employeeService';
import * as moment from 'moment';
import { LoadingController, AlertController, NavController, ToastController } from 'ionic-angular';
import { Component, ChangeDetectorRef } from '@angular/core';

import { SalesServices } from './../../services/salesService';
import { ClosureService } from './../../services/closureService';
import { PosService } from './../../services/posService';

import { SalesModule } from "../../modules/salesModule";
import { PageModule } from "../../metadata/pageModule";
import { Sales } from "./../sales/sales";

import { Sale } from './../../model/sale';
import { Closure } from './../../model/closure';
import { Store } from './../../model/store';
import { POS } from './../../model/pos';
import { StoreService } from "../../services/storeService";
import { PrintService, EndOfDayReportType } from '../../services/printService';
import * as _ from 'lodash';
import { Employee } from '../../model/employee';
import { FountainService } from '../../services/fountainService';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { SyncContext } from "../../services/SyncContext";

@SecurityModule(SecurityAccessRightRepo.OpenCloseRegister)
@PageModule(() => SalesModule)
@Component({
  selector: 'open-close-register',
  templateUrl: 'open-close-register.html',
  providers: [SalesServices, ClosureService, PosService, StoreService]
})
export class OpenCloseRegister {

  public pos: POS;
  public store: Store;
  public closure: Closure;
  public showReport: Boolean;
  public expected: { [type: string]: number } = {
    cash: 0,
    cc: 0,
    total: 0
  };
  public openingPos: { amount: number, notes: string } = {
    amount: null,
    notes: null
  };
  public reason: any = {
    add: { text: 'Cash In' },
    remove: { text: 'Cash Out' }
  };

  private totalCashMaking: number = 0;

  constructor(private loading: LoadingController,
    private posService: PosService,
    private syncContext: SyncContext,
    private employeeService: EmployeeService,
    private closureService: ClosureService,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef,
    private salesService: SalesServices,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private printService: PrintService,
    private fountainService: FountainService) {
    this.cdr.detach();
    this.showReport = false;
  }

  async ionViewDidEnter() {

    let loader = this.loading.create({
      content: 'Loading data...',
    });

    await loader.present();

    let sales: Array<Sale>;

    sales = await this.salesService.findCompletedByPosId(this.syncContext.currentPos._id, this.syncContext.currentPos.openTime);

    this.calculateExpectedCounts(sales);

    this.populateClosure(sales, this.employeeService.getEmployee());
    
    this.printService.openCashDrawer();

    this.cdr.reattach();
    loader.dismiss();
  }

  private populateClosure(sales: Sale[], employee: Employee) {
    this.closure = new Closure();
    this.closure.sales = sales;
    this.closure.posId = this.syncContext.currentPos._id;
    this.closure.posName = this.syncContext.currentPos.name;
    this.closure.storeId = this.syncContext.currentStore._id;
    this.closure.storeName = this.syncContext.currentStore.name;
    this.closure.openTime = this.syncContext.currentPos.openTime;
    this.closure.openingAmount = this.syncContext.currentPos.openingAmount;
    this.closure.totalCashMaking = this.totalCashMaking;
    this.closure.totalCashIn = _.sumBy(this.syncContext.currentPos.cashMovements, cashMovement => cashMovement.type == 'add' ? cashMovement.amount : 0);
    this.closure.totalCashOut = _.sumBy(this.syncContext.currentPos.cashMovements, cashMovement => cashMovement.type == 'remove' ? cashMovement.amount : 0);
    this.closure.employeeFullName = `${employee.firstName} ${employee.lastName}`;
    this.closure.employeeId = employee._id;
    this.calculateDiff('cash');
    this.calculateDiff('cc');
  }

  private calculateExpectedCounts(sales: Array<Sale>) {

    if (sales) {
      sales.forEach((sale) => {
        sale.payments.forEach((payment) => {
          if (payment.type === 'credit_card') {
            this.expected.cc += payment.amount;
          }
          if (payment.type === 'cash') {
            this.expected.cash += payment.amount;
          }
        });
      });
    }
    this.totalCashMaking = this.expected.cash;
    this.expected.cash += this.syncContext.currentPos.openingAmount;
    if (this.syncContext.currentPos.cashMovements && this.syncContext.currentPos.cashMovements.length > 0) {
      this.expected.cash = ((expected) => {
        let sum = 0;
        this.syncContext.currentPos.cashMovements.forEach(cash => sum += cash.amount);
        return this.expected.cash + sum;
      })(this.expected.cash);
    }
    this.expected.total = this.expected.cc + this.expected.cash;
  }

  public calculateDiff(type) {
    let counted = type + 'Counted';
    let difference = type + 'Difference';
    this.closure[counted] = Number(this.closure[counted]);
    this.closure[difference] = this.expected[type] - this.closure[counted];
    this.closure.totalCounted = Number(this.closure.ccCounted) + Number(this.closure.cashCounted);
    this.closure.totalDifference = this.expected.total - this.closure.totalCounted;
  }

  public async closeRegister() {
    if (this.salesService.isSalePresent()) {
      let confirm = this.alertCtrl.create({
        title: 'Alert!',
        message: 'There is a sale already exists in your memory. What do you want with it ?',
        buttons: [
          {
            text: 'Discard It!',
            handler: () => {
              let toast = this.toastCtrl.create({
                message: 'Sale has been discarded! You can now close the register.',
                duration: 3000
              });
              toast.present();
              localStorage.removeItem('sale_id');
            }
          },
          {
            text: 'Take me to that Sale',
            handler: () => {
              this.navCtrl.setRoot(Sales);
            }
          }
        ]
      });
      confirm.present();
    } else {
      let loader = this.loading.create({
        content: 'Closing Register...',
      });

      await loader.present();

      loader.setContent("Checking other POS closure status..");
      this.clockOutEmployeesIfRequired();

      loader.setContent("Saving and Printing Closure..");

      this.closure.closeTime = moment().utc().format();
      this.closure.closureNumber = await this.fountainService.getClosureNumber();
      await this.closureService.add(this.closure);

      this.printService.printEndOfDayReport(this.closure, EndOfDayReportType.PerCategory);

      this.syncContext.currentPos.status = false;
      this.syncContext.currentPos.cashMovements = [];
      this.syncContext.currentPos.openingAmount = null;
      this.syncContext.currentPos.openTime = null;
      this.syncContext.currentPos.openingNote = null;
      this.showReport = true;
      this.posService.update(this.syncContext.currentPos);

      loader.dismiss();

      let toast = this.toastCtrl.create({
        message: 'Register Closed',
        duration: 3000
      });
      toast.present();
    }
  }

  private async clockOutEmployeesIfRequired(){
    try{
      if (await this.posService.isThisLastPosClosingInStore(this.syncContext.currentPos._id)) {
        await this.employeeService.clockOutClockedInOfStore(this.syncContext.currentStore._id, this.closure.closeTime);
      }
    }catch(ex){

    }
  }

  public onSubmit() {
    this.navCtrl.setRoot(Sales, { openingAmount: this.openingPos.amount, openingNotes: this.openingPos.notes });
  }

}