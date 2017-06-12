import { Sale } from './../../model/sale';
import { SalesServices } from './../../services/salesService';
import { ClosureService } from './../../services/closureService';
import { Closure } from './../../model/closure';
import { Store } from './../../model/store';
import { POS } from './../../model/pos';
import { StoreService } from './../../services/storeService';
import { PosService } from './../../services/posService';
import { LoadingController } from 'ionic-angular';
import { Component, ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'open-close-pos',
  templateUrl: 'open-close-register.html',
  styleUrls: [ '/pages/open-close-register.scss' ]
})
export class OpenCloseRegister {

  public register: POS;
  public store: Store;
  public closure: Closure;
  public posClosures: Array<Closure> = [];
  public cashExpected: number = 0;
  public ccExpected: number = 0;
  public totalExpected: number = 0;

  constructor(
    private loading: LoadingController,
    private posService: PosService,
    private storeService: StoreService,
    private closureService: ClosureService,
    private cdr: ChangeDetectorRef,
    private salesService: SalesServices
  ) {
    this.cdr.detach();
    this.closure = new Closure();
  }

  ionViewDidEnter() {
    let loader = this.loading.create({
      content: 'Loading data...',
    });

    loader.present().then(() => {
      this.posService.setupRegister().then((pos: POS) => {
        this.register = pos;

        var storePromise = this.storeService.get(pos.storeId).then((store: Store) => {
          this.store = store;
        }).catch((error) => {
          console.error(new Error(error));
        });

        var closuresPromise = this.closureService.getAllByPOSId(pos._id).then((closures: Array<Closure>) => {
          if(closures.length > 0) {
            this.posClosures = closures;
          }
        }).catch((error) => {
          console.error(new Error(error));
        });

        var salesPromise = this.salesService.findAllByPosId(pos._id).then((invoices: Array<Sale>) => {
          invoices.forEach((invoice) => {
            invoice.payments.forEach((payment) => {
              if(payment.type === 'credit_card') {
                this.ccExpected += payment.amount;
              }
              if(payment.type === 'cash') {
                this.cashExpected += payment.amount;
              }
            });

            this.totalExpected = this.ccExpected + this.cashExpected;
          });
        });

        Promise.all([ storePromise, closuresPromise, salesPromise ]).then(() => {
          this.cdr.reattach();
          loader.dismiss();
        });
      });
    });
  }
}