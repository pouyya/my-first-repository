import { UserService } from './../../services/userService';
import { Sale } from './../../model/sale';
import { SalesServices } from './../../services/salesService';
import { ClosureService } from './../../services/closureService';
import { Closure } from './../../model/closure';
import { Store } from './../../model/store';
import { POS } from './../../model/pos';
import { StoreService } from './../../services/storeService';
import { PosService } from './../../services/posService';
import { LoadingController, AlertController, NavController } from 'ionic-angular';
import { Component, ChangeDetectorRef } from '@angular/core';
import { SalesModule } from "../../modules/salesModule";
import { PageModule } from "../../metadata/pageModule";
import { Sales } from "./../sales/sales.ts";

@PageModule(() => SalesModule)
@Component({
  selector: 'open-close-pos',
  templateUrl: 'open-close-register.html',
  styleUrls: ['/pages/open-close-register.scss'],
  providers: [SalesServices, ClosureService, StoreService, PosService]
})
export class OpenCloseRegister {

  public register: POS;
  public store: Store;
  public closure: Closure;
  public posClosures: Array<Closure> = [];
  public showReport: Boolean;
  public expected: any = {
    cash: 0,
    cc: 0,
    total: 0
  };
  public openingPos: any = {
    amount: 0,
    notes: null
  };

  constructor(
    private loading: LoadingController,
    private posService: PosService,
    private storeService: StoreService,
    private closureService: ClosureService,
    private cdr: ChangeDetectorRef,
    private salesService: SalesServices,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private userService: UserService
  ) {
    this.cdr.detach();
    this.showReport = false;
  }

  ionViewDidEnter() {
    let loader = this.loading.create({
      content: 'Loading data...',
    });

    loader.present().then(() => {
      var user = this.userService.getLoggedInUser();
      this.register = user.currentPos;
      this.store = user.currentStore;
      var closuresPromise = this.closureService.getAllByPOSId(this.register._id).then((closures: Array<Closure>) => {
        if (closures.length > 0) {
          this.posClosures = closures;
        }
      }).catch((error) => {
        console.error(new Error(error));
      });

      var salesPromise = this.salesService.findCompletedByPosId(this.register._id, this.register.openTime).then((invoices: Array<Sale>) => {
        invoices.forEach((invoice) => {
          invoice.payments.forEach((payment) => {
            if (payment.type === 'credit_card') {
              this.expected.cc += Number(payment.amount);
            }
            if (payment.type === 'cash') {
              this.expected.cash += Number(payment.amount);
            }
          });

          this.expected.total = this.expected.cc + this.expected.cash;
        });
      });

      Promise.all([closuresPromise, salesPromise]).then(() => {
        this.closure = new Closure();
        this.closure.posId = this.register._id;
        this.closure.posName = this.register.name;
        this.closure.storeName = this.store.name;
        this.calculateDiff('cash');
        this.calculateDiff('cc');
        this.cdr.reattach();
        loader.dismiss();
      });
    });
  }

  public calculateDiff(type) {
    var counted = type + 'Counted';
    var difference = type + 'Difference';
    this.closure[counted] = Number(this.closure[counted])
    this.closure[difference] = this.expected[type] - this.closure[counted];
    this.closure.totalCounted = Number(this.closure.ccCounted) + Number(this.closure.cashCounted);
    this.closure.totalDifference = this.expected.total - this.closure.totalCounted;
  }

  public closeRegister() {
    this.salesService.findInCompletedByPosId(this.register._id).then((sales) => {
      if (sales.length > 0) {
        let alert = this.alertCtrl.create({
          title: 'Warning!',
          subTitle: 'You have some incomplete sale left. You can\'t close register until you either discard those sale or complete them.',
          buttons: ['OK']
        });
        alert.present();
      } else {
        this.closure.closeTime = new Date().toISOString();
        this.closureService.add(this.closure).then(() => {
          this.register.status = false;
          this.register.openingAmount = 0;
          this.register.openTime = null;
          this.register.openingNote = null;
          this.showReport = true;
          this.posService.update(this.register);
        }).catch((error) => {
          throw new Error(error);
        });
      }
    });
  }

  public onSubmit() {
    this.navCtrl.push(Sales, { openingAmount: this.openingPos.amount, openingNotes: this.openingPos.notes });
  }

}