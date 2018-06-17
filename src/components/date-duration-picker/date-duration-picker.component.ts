import { Component, Input } from "@angular/core";
import { ModalController } from "ionic-angular";
import { Subject } from "rxjs/Subject";

@Component({
  selector: 'date-duration-picker',
  template: `<ion-grid>
      <ion-row>
          <ion-col col-md-3>
              <ion-select class="white-bg full-width" [(ngModel)]="selectedTimeframe" (ngModelChange)="selectedTimeframe !== 'CUSTOM' && calculate()">
                  <ion-option *ngFor="let timeframe of timeframes" [value]="timeframe.value">{{ timeframe.text }}</ion-option>
              </ion-select>
          </ion-col>
      </ion-row>
      <ion-row *ngIf="selectedTimeframe === 'CUSTOM' ">
          <ion-col>
              <ion-item>
                  <ion-label>From</ion-label>
                  <ion-datetime displayFormat="MM/DD/YYYY" [(ngModel)]="fromDate"></ion-datetime>
              </ion-item>
          </ion-col>
          <ion-col>
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
    public timeframes = [{text: "Today", value: "TODAY"}, {text: "Yesterday", value: "YESTERDAY"},
        {text: "Week", value: "WEEK"}, {text: "Month", value: "MONTH"}, {text: "Custom", value: "CUSTOM"}];
    public selectedTimeframe: string;

    constructor(private modalCtrl: ModalController) {
        this.selectedTimeframe = this.timeframes[0].value;

    }
    public calculate() {
        let fromDate = new Date(), toDate = new Date();
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