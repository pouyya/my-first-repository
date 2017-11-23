import * as moment from 'moment';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'group-employee-timelog',
  templateUrl: 'group-employee-timelog.html'
})
export class GroupEmployeeTimeLog implements OnInit {

  public _timeLog: any;
  public _dateKey: string;
  public _employeeKey: string;
  public _dateIndex: number | any;
  public _employeeIndex: number | any;
  public renderable: any = {
    name: "",
    store: "",
    clockIn: "No time logged",
    clockOut: "No time logged"
  };

  @Input('timeLog')
  set timelogInput(data: any) {
    this._timeLog = data;
  }

  @Input('dateKey')
  set dateKeyInput(key: string) {
    this._dateKey = key;
  }

  @Input('employeeKey')
  set employeeKeyInput(key: string) {
    this._employeeKey = key;
  }

  @Input('index')
  set indexInput(indices: any) {
    this._dateIndex = indices.dateIndex;
    this._employeeIndex = indices.employeeIndex;
  }

  @Output() viewLogs: EventEmitter<any> = new EventEmitter<any>();
  @Output() removeAll: EventEmitter<any> = new EventEmitter<any>()

  ngOnInit() {
    if (this._timeLog && this._timeLog.length > 0) {
      this._timeLog.forEach((log, index) => {
        if (log.type == 'clock_in') {
          this.renderable.clockIn = moment(log.time).format('DD/MM/YYYY h:mm:ss A');
        } else if (log.type == 'clock_out') {
          this.renderable.clockOut = moment(log.time).format('DD/MM/YYYY h:mm:ss A');
        }
      });
      if (this._timeLog[0].employee) {
        this.renderable.employee = this._timeLog[0].employee;
        this.renderable.name = `${this._timeLog[0].employee.firstName} ${this._timeLog[0].employee.lastName}`;
      }
      if (this._timeLog[0].store) {
        this.renderable.store = this._timeLog[0].store.name;
      }
    }
  }

  public viewDetails() {
    this.viewLogs.emit({
      timestamps: this._timeLog,
      employee: this.renderable.employee,
      dateKey: this._dateKey
    });
  }

  public remove() {
    this.removeAll.emit({
      dateIndex: this._dateIndex,
      employeeIndex: this._employeeIndex,
      employeeName: this.renderable.name,
      employee: this.renderable.employee,
      date: this._dateKey
    });
  }
}