import * as moment from 'moment';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'group-employee-timelog',
  template: `<ion-grid>
    <ion-row>
      <ion-col col-md-3>
        <span>{{ renderable.name }}</span>
      </ion-col>
      <ion-col col-md-3>
        <span>{{ renderable.store }}</span>
      </ion-col>
      <ion-col col-md-2>
        <span>{{ renderable.clockIn }}</span>
      </ion-col>
      <ion-col col-md-2>
        <span>{{ renderable.clockOut }}</span>
      </ion-col>
      <ion-col col-md-1 tappable>
        <ion-icon name="eye" (click)="viewDetails()"></ion-icon>
      </ion-col>
      <ion-col col-md-1 tappable>
        <ion-icon name="trash" (click)="remove()"></ion-icon>
      </ion-col>
    </ion-row>
  </ion-grid>`
})
export class GroupEmployeeTimeLog {

  public _timeLog: any;
  public _dateKey: string;
  public _employeeKey: string;
  public renderable: any = {
    name: "",
    store: "",
    clockIn: "No time logged",
    clockOut: "No time logged"
  };

  @Input('data')
  set timelog(arr: any) {
    this._timeLog = [...arr.timeLogs];
    this._dateKey = arr.dateKey;
    this._employeeKey = arr.employeeKey;
    if (this._timeLog && this._timeLog.length > 0) {
      this._timeLog.forEach((log, index) => {
        if (log.type == 'clock_in') {
          this.renderable.clockIn = moment(log.time).format('DD/MM/YYYY h:mm:ss A');
        } else if (log.type == 'clock_out') {
          this.renderable.clockOut = moment(log.time).format('DD/MM/YYYY h:mm:ss A');
        }
      });
      if(this._timeLog[0].employee) {
        this.renderable.employee = this._timeLog[0].employee;
        this.renderable.name = `${this._timeLog[0].employee.firstName} ${this._timeLog[0].employee.lastName}`;
      }
      if(this._timeLog[0].store) {
        this.renderable.store = this._timeLog[0].store.name;
      }
    }
  }

  @Output() viewLogs: EventEmitter<any> = new EventEmitter<any>();
  @Output() removeAll: EventEmitter<any> = new EventEmitter<any>()

  public viewDetails() {
    this.viewLogs.emit({ timestamps: this._timeLog, employee: this.renderable.employee, dateKey: this._dateKey });
  }

  public remove() {
    this.removeAll.emit({});
  }
}