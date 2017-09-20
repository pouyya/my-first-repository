import { ModalController } from 'ionic-angular';
import { MoveCashModal } from './modals/move-cash';
import { CashMovement, POS } from './../../model/pos';
import { PosService } from './../../services/posService';
import { Component } from '@angular/core';
import { SalesModule } from "../../modules/salesModule";
import { PageModule } from './../../metadata/pageModule';
import { UserService } from './../../services/userService';

@PageModule(() => SalesModule)
@Component({
  selector: 'money-in-out',
  templateUrl: 'money-in-out.html'
})
export class MoneyInOut {

  public cash: CashMovement;
  private register: POS;
  private user: any;

  constructor(
    private modalCtrl: ModalController,
    private userService: UserService,
    private posService: PosService) {
    this.cash = { amount: 0, type: null, note: null, datetime: null };
    this.user = this.userService.getLoggedInUser();
  }

  ionViewCanEnter(): boolean {
    return this.user.currentPos.status;
  }

  async ionViewDidLoad() {
    try {
      this.register = await this.posService.get(this.user.settings.currentPos);
      return this.register;
    } catch (error) {
      throw new Error(error);
    }
  }

  public openMoveCashModal(reason: string): void {
    let modal = this.modalCtrl.create(MoveCashModal, { reason });
    modal.dismiss((data: any) => {
      
    });
    modal.present();
  }
}