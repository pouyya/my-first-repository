import { ModalController } from 'ionic-angular';
import { MoveCashModal } from './modals/move-cash';
import { CashMovement, POS } from './../../model/pos';
import { PosService } from './../../services/posService';
import { Component, ChangeDetectorRef } from '@angular/core';
import { SalesModule } from "../../modules/salesModule";
import { PageModule } from './../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { PrintService } from '../../services/printService';

@SecurityModule(SecurityAccessRightRepo.MoneyInOut)
@PageModule(() => SalesModule)
@Component({
  selector: 'money-in-out',
  templateUrl: 'money-in-out.html'
})
export class MoneyInOut {

  private register: POS;
  public btnDisabled: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
    private posService: PosService,
    private printService: PrintService) {
    this.cdr.detach();
  }

  ionViewCanEnter(): Promise<boolean> {
    return this.posService.getCurrentPosStatus();
  }

  async ionViewDidLoad() {
    this.register = await this.posService.getCurrentPos();
    this.cdr.reattach();
  }

  public openMoveCashModal(reason: string): void {
    let modal = this.modalCtrl.create(MoveCashModal, { reason });
    modal.onDidDismiss((cash: CashMovement) => {
      if (cash) {
        this.btnDisabled = true;

        if (!this.register.cashMovements) {
          this.register.cashMovements = new Array<CashMovement>();
        }

        this.printService.openCashDrawer();

        this.register.cashMovements.push(cash);
        this.posService.update(this.register).catch(error => {
          throw new Error(error);
        }).then(() => this.btnDisabled = false);
      }
    });
    modal.present();
  }
}