import { Component, Input } from "@angular/core";
import { ModalController } from "ionic-angular";
import { Subject } from "rxjs/Subject";
import {DateTimeService} from "../../services/dateTimeService";

@Component({
  selector: 'date-duration-picker',
  template: `<ion-grid no-padding>
      <ion-row >
          <ion-col col-md-3>
              <ion-select class="white-bg full-width" [(ngModel)]="selectedTimeframe" (ngModelChange)="selectedTimeframe !== 'CUSTOM' && calculate()">
                  <ion-option *ngFor="let timeframe of timeframes" [value]="timeframe.value">{{ timeframe.text }}</ion-option>
              </ion-select>
          </ion-col>
      </ion-row>
      <ion-row *ngIf="selectedTimeframe === 'CUSTOM' ">
          <ion-col col-md-3>
              <ion-item>
                  <ion-label>From</ion-label>
                  <ion-datetime displayFormat="MM/DD/YYYY" [(ngModel)]="fromDate"></ion-datetime>
              </ion-item>
          </ion-col>
          <ion-col col-md-3>
              <ion-item>
                  <ion-label>To</ion-label>
                  <ion-datetime displayFormat="MM/DD/YYYY" [(ngModel)]="toDate"></ion-datetime>
              </ion-item>
          </ion-col>
          <ion-col>
              <button [disabled]="!fromDate || !toDate || fromDate > toDate" ion-button (click)="calculate()">Calculate</button>
          </ion-col>
      </ion-row>
  </ion-grid>`,
  styleUrls: ['/components/date-duration-picker.scss']
})
export class DateDurationPickerComponent {
    public fromDate: Date;
    public toDate: Date;
    @Input() dates$: Subject<Object>;
    @Input() selectedValue: string;

    public timeframes = [{text: "Today", value: "TODAY"}, {text: "Yesterday", value: "YESTERDAY"},
        {text: "Week", value: "WEEK"}, {text: "Month", value: "MONTH"}, {text: "Custom", value: "CUSTOM"}];
    public selectedTimeframe: string;

    constructor() {}

    ngAfterViewInit() {
        let timeframeIndex = 0;
        if(this.selectedValue) {
            this.timeframes.some((timeframe, index) => {
                if(timeframe.value == this.selectedValue){
                    timeframeIndex = index;
                    return true;
                }
            });
        }
        this.selectedTimeframe = this.timeframes[timeframeIndex].value;

    }
    public calculate() {
        let fromDate = this.dateTimeService.getTimezoneDate(new Date()).toDate(),
            toDate = this.dateTimeService.getTimezoneDate(new Date()).toDate();
        fromDate.setHours(0);
        fromDate.setMinutes(0);
        fromDate.setSeconds(0);
        switch (this.selectedTimeframe) {
            case 'YESTERDAY':
                fromDate.setDate(fromDate.getDate() - 1);
                toDate.setDate(toDate.getDate() - 1);
                toDate.setHours(23);
                toDate.setMinutes(59);
                toDate.setSeconds(59);
                break;
            case 'WEEK':
                fromDate.setDate(fromDate.getDate() - 7);
                break;
            case 'MONTH':
                fromDate.setMonth(fromDate.getMonth() - 1);
                break;
            case 'CUSTOM':
                fromDate = new Date(this.fromDate);
                toDate = new Date(this.toDate);
                break;
        }
        this.dates$.next({fromDate, toDate});
    }
}