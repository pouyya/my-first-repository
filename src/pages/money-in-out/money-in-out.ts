import { ModalController } from 'ionic-angular';
import { MoveCashModal } from './modals/move-cash';
import { CashMovement, POS } from './../../model/pos';
import { PosService } from './../../services/posService';
import { Component, ChangeDetectorRef } from '@angular/core';
import { SalesModule } from "../../modules/salesModule";
import { PageModule } from './../../metadata/pageModule';
import { UserService } from './../../services/userService';

@PageModule(() => SalesModule)
@Component({
  selector: 'money-in-out',
  templateUrl: 'money-in-out.html'
})
export class MoneyInOut {

  private register: POS;
  private user: any;
  public btnDisabled: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
    private userService: UserService,
    private posService: PosService) {
    this.user = this.userService.getLoggedInUser();
    this.cdr.detach();
  }

  ionViewCanEnter(): Promise<boolean> {
    return this.posService.getCurrentPosStatus();
  }

  ionViewDidLoad() {
    this.posService.get(this.user.settings.currentPos).then((register: POS) => {
      this.register = register;
    }).catch(error => {
      throw new Error(error);
    }).then(() => this.cdr.reattach());
  }

  public openMoveCashModal(reason: string): void {
    let modal = this.modalCtrl.create(MoveCashModal, { reason });
    modal.onDidDismiss((cash: CashMovement) => {
      if(cash) {
        this.btnDisabled = true;
        
        if(!this.register.cashMovements) {
          this.register.cashMovements = new Array<CashMovement>();
        }

        this.register.cashMovements.push(cash);
        this.posService.update(this.register).catch(error => {
          throw new Error(error);
        }).then(() => this.btnDisabled = false);
      }
    });
    modal.present();
  }
}