import { ToastController } from 'ionic-angular';
import { LoadingController, AlertController, NavController } from 'ionic-angular';
import { Component, ChangeDetectorRef } from '@angular/core';

import { UserService } from './../../services/userService';
import { SalesServices } from './../../services/salesService';
import { ClosureService } from './../../services/closureService';
import { PosService } from './../../services/posService';

import { SalesModule } from "../../modules/salesModule";
import { PageModule } from "../../metadata/pageModule";
import { Sales } from "./../sales/sales.ts";

import { Sale } from './../../model/sale';
import { Closure } from './../../model/closure';
import { Store } from './../../model/store';
import { POS } from './../../model/pos';
import { StoreService } from "../../services/storeService";

@PageModule(() => SalesModule)
@Component({
  selector: 'open-close-pos',
  templateUrl: 'open-close-register.html',
  styleUrls: ['/pages/open-close-register.scss'],
  providers: [SalesServices, ClosureService, PosService, StoreService]
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
    private closureService: ClosureService,
    private toastCtrl: ToastController,
    private cdr: ChangeDetectorRef,
    private salesService: SalesServices,
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private userService: UserService) {
    this.cdr.detach();
    this.showReport = false;
  }

  ionViewDidEnter() {
    let loader = this.loading.create({
      content: 'Loading data...',
    });

    loader.present().then(() => {
      let user = this.userService.getLoggedInUser();
      let promises: Array<Promise<any>> = [
        this.posService.get(user.settings.currentPos),
        this.storeService.get(user.settings.currentStore)
      ];

      Promise.all(promises).then((response) => {
        this.register = response[0] as POS;
        this.store = response[1] as Store;

        promises = [
          this.closureService.getAllByPOSId(this.register._id),
          this.salesService.findCompletedByPosId(this.register._id, this.register.openTime)
        ];

        Promise.all(promises).then((response) => {
          let closures = response[0] as Array<Closure>;
          let invoices = response[1] as Array<Sale>;

          closures.length > 0 && (this.posClosures = closures);

          invoices.forEach((invoice) => {
            invoice.payments.forEach((payment) => {
              if (payment.type === 'credit_card') {
                this.expected.cc += Number(payment.amount);
              }
              if (payment.type === 'cash') {
                this.expected.cash += Number(payment.amount);
              }
            });
          });

          this.expected.cash += this.register.openingAmount;
          if (this.register.cashMovements && this.register.cashMovements.length > 0) {
            this.expected.cash = ((expected) => {
              let sum = 0;
              this.register.cashMovements.forEach(cash => sum += cash.amount);
              return this.expected.cash + sum;
            })(this.expected.cash);
          }
          this.expected.total = this.expected.cc + this.expected.cash;

          this.closure = new Closure();
          this.closure.posId = this.register._id;
          this.closure.posName = this.register.name;
          this.closure.storeName = this.store.name;
          this.calculateDiff('cash');
          this.calculateDiff('cc');
        }).catch(error => {
          throw new Error(error);
        }).then(() => {
          this.cdr.reattach();
          loader.dismiss();
        });

      }).catch(error => {
        throw new Error(error);
      });
    });
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
    var sales = await this.salesService.findInCompletedByPosId(this.register._id)
    if (sales.length > 0) {
      let alert = this.alertCtrl.create({
        title: 'Warning!',
        subTitle: 'You have some incomplete sale left. You can\'t close register until you either discard those sale or complete them.',
        buttons: ['OK']
      });
      alert.present();
    } else {
      this.closure.closeTime = new Date().toISOString();
      this.closure.cashMovements = this.register.cashMovements;
      await this.closureService.add(this.closure);
      this.register.status = false;
      this.register.cashMovements = [];
      this.register.openingAmount = null;
      this.register.openTime = null;
      this.register.openingNote = null;
      this.showReport = true;
      await this.posService.update(this.register)
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