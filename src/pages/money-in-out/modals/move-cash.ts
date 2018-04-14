import { CashMovement } from './../../../model/store';
import { ViewController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';
import { EmployeeService } from '../../../services/employeeService';

@Component({
  selector: 'move-cash',
  templateUrl: 'move-cash.html'
})
export class MoveCashModal {

  public cash: CashMovement;
  public reason: string;
  public submitBtns: any = {
    add: { text: 'Add Cash', color: 'primary' },
    remove: { text: 'Remove Cash', color: 'danger' }
  };

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private employeeService: EmployeeService
  ) {
    this.reason = this.navParams.get('reason');
    this.cash = { amount: 0, type: this.reason, datetime: null, note: "", employeeId: "" };
  }

  public dismiss() {
    this.viewCtrl.dismiss(null);
  }

  public onSubmit() {
    this.cash.amount = ((amount) => {
      amount = Number(amount);
      this.reason == 'remove' && (amount *= -1);
      return amount;
    })(this.cash.amount);
    this.cash.employeeId = this.employeeService.getEmployee()._id;
    this.cash.datetime = new Date;
    this.viewCtrl.dismiss(this.cash);
  }

}