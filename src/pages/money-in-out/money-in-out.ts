import { ModalController } from 'ionic-angular';
import { MoveCashModal } from './modals/move-cash';
import { CashMovement } from './../../model/store';
import { Component, ChangeDetectorRef } from '@angular/core';
import { SalesModule } from "../../modules/salesModule";
import { PageModule } from './../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { PrintService } from '../../services/printService';
import { SyncContext } from "../../services/SyncContext";
import { StoreService } from "../../services/storeService";

@SecurityModule(SecurityAccessRightRepo.MoneyInOut)
@PageModule(() => SalesModule)
@Component({
  selector: 'money-in-out',
  templateUrl: 'money-in-out.html'
})
export class MoneyInOut {

  public btnDisabled: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
    private storeService: StoreService,
    private printService: PrintService,
    private syncContext: SyncContext) {
    this.cdr.detach();
  }

  ionViewCanEnter(): boolean {
    return this.syncContext.currentPos.status;
  }

  async ionViewDidLoad() {
    this.cdr.reattach();
  }

  public openMoveCashModal(reason: string): void {
    this.printService.openCashDrawer();
    let modal = this.modalCtrl.create(MoveCashModal, { reason });
    modal.onDidDismiss((cash: CashMovement) => {
      if (cash) {
        this.btnDisabled = true;

        if (!this.syncContext.currentPos.cashMovements) {
          this.syncContext.currentPos.cashMovements = new Array<CashMovement>();
        }

        this.syncContext.currentPos.cashMovements.push(cash);
        this.storeService.updatePOS(this.syncContext.currentPos).catch(error => {
          throw new Error(error);
        }).then(() => this.btnDisabled = false);
      }
    });
    modal.present();
  }
}