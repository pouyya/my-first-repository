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

@SecurityModule(SecurityAccessRightRepo.OpenCloseRegister)
@PageModule(() => SalesModule)
@Component({
  selector: 'open-close-pos',
  templateUrl: 'open-close-register.html',
  styleUrls: ['/pages/open-close-register.scss'],
  providers: [SalesServices, ClosureService, PosService, StoreService]
})
export class OpenCloseRegister {

  public pos: POS;
  public store: Store;
  public closure: Closure;
  public showReport: Boolean;
  public expected: any = {
    cash: 0,
    cc: 0,
    total: 0
  };
  public openingPos: any = {
    amount: null,
    notes: null
  };
  public reason: any = {
    add: { text: 'Cash In' },
    remove: { text: 'Cash Out' }
  };

  constructor(private loading: LoadingController,
    private posService: PosService,
    private storeService: StoreService,
    private employeeService: EmployeeService,
    private closureService: ClosureService,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef,
    private salesService: SalesServices,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private prinService: PrintService,
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

    this.pos = await this.posService.getCurrentPos();

    [sales, this.store] = await Promise.all([
      this.salesService.findCompletedByPosId(this.pos._id, this.pos.openTime),
      this.storeService.getCurrentStore()
    ]);

    this.calculateExpectedCounts(sales);

    this.populateClosure(sales, this.employeeService.getEmployee());

    this.cdr.reattach();
    loader.dismiss();
  }

  private populateClosure(sales: Sale[], employee: Employee) {
    this.closure = new Closure();
    this.closure.sales = sales;
    this.closure.posId = this.pos._id;
    this.closure.posName = this.pos.name;
    this.closure.storeId = this.store._id;
    this.closure.storeName = this.store.name;
    this.closure.openTime = this.pos.openTime;
    this.closure.openingAmount = this.pos.openingAmount;
    this.closure.totalCashIn = _.sumBy(this.pos.cashMovements, cashMovement => cashMovement.type == 'add' ? cashMovement.amount : 0);
    this.closure.totalCashOut = _.sumBy(this.pos.cashMovements, cashMovement => cashMovement.type == 'remove' ? cashMovement.amount : 0);
    this.closure.employeeFullName = `${employee.firstName} ${employee.lastName}`;
    this.closure.employeeId = employee._id;
    this.calculateDiff('cash');
    this.calculateDiff('cc');
  }

  private calculateExpectedCounts(sales: Array<Sale>) {

    if (sales) {
      sales.forEach((sale) => {
        sale.payments.forEach((payment) => {
          var isRefund = sale.state == 'refund';
          var amount = (isRefund ? -1 : 1) * Number(payment.amount);
          if (payment.type === 'credit_card') {
            this.expected.cc += amount;
          }
          if (payment.type === 'cash') {
            this.expected.cash += amount;
          }
        });
      });
    }

    this.expected.cash += this.pos.openingAmount;
    if (this.pos.cashMovements && this.pos.cashMovements.length > 0) {
      this.expected.cash = ((expected) => {
        let sum = 0;
        this.pos.cashMovements.forEach(cash => sum += cash.amount);
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
    let sale = await this.salesService.getCurrentSaleIfAny();
    if (sale) {
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
      if (await this.posService.isThisLastPosClosingInStore(this.pos._id)) {
        loader.setContent("Clocking out current staff..");
        await this.employeeService.clockOutClockedInOfStore(this.store._id, this.closure.closeTime);
      }

      loader.setContent("Saving and Printing Closure..");

      this.closure.closeTime = moment().utc().format();
      this.closure.closureNumber = await this.fountainService.getClosureNumber();
      await this.closureService.add(this.closure);

      this.prinService.printEndOfDayReport(this.closure, EndOfDayReportType.PerCategory);

      this.pos.status = false;
      this.pos.cashMovements = [];
      this.pos.openingAmount = null;
      this.pos.openTime = null;
      this.pos.openingNote = null;
      this.showReport = true;
      await this.posService.update(this.pos);

      loader.dismiss();

      let toast = this.toastCtrl.create({
        message: 'Register Closed',
        duration: 3000
      });
      toast.present();
    }
  }

  public onSubmit() {
    this.navCtrl.setRoot(Sales, { openingAmount: this.openingPos.amount, openingNotes: this.openingPos.notes });
  }

}