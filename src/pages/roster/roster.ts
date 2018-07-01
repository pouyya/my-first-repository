 // Angular Library Imports
import { Component, ChangeDetectionStrategy, NgZone, OnInit, OnDestroy } from '@angular/core';
import { CalendarEvent, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { WeekDay } from 'calendar-utils';
import { Subject } from 'rxjs/Subject';
import { colors } from './components/colors';
import { NgbDateStruct, NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
// Ionic Library Imports
import {NavController, NavParams, ModalController, LoadingController} from 'ionic-angular';
// Our Custom Imports
// Other Imports
import * as moment from 'moment';
import * as _ from 'lodash';
import { StoreService } from "../../services/storeService";
import { SecurityModule } from "../../infra/security/securityModule";
import { SecurityAccessRightRepo } from "../../model/securityAccessRightRepo";
import { HumanResourceModule } from "../../modules/humanResourceModule";
import { PageModule } from "../../metadata/pageModule";
import { Store } from "../../model/store";
import { Employee } from "../../model/employee";
import { EmployeeService } from "../../services/employeeService";
 import {ShiftModalPage} from "./modals/shift-modal/shift-modal";
 import {ShiftService} from "../../services/shiftService";
 import {Shift, ShiftStatus} from "../../model/shift";
 import {SyncContext} from "../../services/SyncContext";

const equals = (one: NgbDateStruct, two: NgbDateStruct) =>
  one && two && two.year === one.year && two.month === one.month && two.day === one.day;

const before = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day < two.day : one.month < two.month : one.year < two.year;

const after = (one: NgbDateStruct, two: NgbDateStruct) =>
  !one || !two ? false : one.year === two.year ? one.month === two.month ? one.day === two.day
    ? false : one.day > two.day : one.month > two.month : one.year > two.year;

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

@SecurityModule(SecurityAccessRightRepo.Roster)
@PageModule(() => HumanResourceModule)
@Component({
  selector: 'page-roster',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'roster.html',
})
export class Roster implements OnDestroy{

  // To hold selected store
  public selectedStore: Store;
  // To hold store list
  public stores: Array<Store> = [];
  // To hold Employee List
  public employees: Array<Employee> = [];
  public storeEmployees: Array<Employee> = [];
  // To hold view. Default view is week.
  public view: string = 'week';
  // To hold view date as current date
  public viewDate: Date = new Date();
  // To refresh calendar, observable event
  public refresh: Subject<any> = new Subject();
  // To hold shifts as list
  public events: Array<any> = [];
  // To hold datepicker value
  public datePickerValue: any = moment();
  // To hold date on hover
  public hoveredDate: NgbDateStruct;
  // To hold start date for range
  public fromDate: NgbDateStruct;
  // to hold end date for range
  public toDate: NgbDateStruct;
  // To hold date range as string
  public dateRange: any;
  // To hold jump to current week
  public isJumpToCurrentWeek: boolean = false;
  // To hold pushed count
  public publishedCount: number = 0;
  // To hold unpushed count
  public unpublishedCount: number = 0;
  // To hold week day
  public day: WeekDay;
  // To hold today date
  public todayDate: Date = new Date();
  // To hold search string
  public search: any;
  // To hold moment instance
  public moment: any;
  constructor(private ngZone: NgZone, private calendar: NgbCalendar, private storeService: StoreService,
              private employeeService: EmployeeService, public modalCtrl: ModalController,
              public navCtrl: NavController, public navParams: NavParams, private shiftService: ShiftService,
              private loading: LoadingController) {
    // Initialize with today's date
    this.fromDate = this.calendar.getToday();
    this.dateRange = moment().format('DD MMM');
    // Handle angular zone from info window in map
    window["angularComponentRef"] = { component: this, zone: this.ngZone };
    this.moment = moment;
  }

  /**
   * Get Total Allocated Time
   */
  public getTotalAllocatedTime(start: string, end: string): string {
    let startTime=moment(start);
    let endTime=moment(end);
    let duration = moment.duration(endTime.diff(startTime));
    let hours = duration.asHours();
    // let minutes = duration.asMinutes()-hours*60;
    return hours+'';
  }

  /**
   * Open Shift Modal
   */
  public openShiftModal(event: any, mode: string) {
    let totalInHours = 0;
    let shiftLength = 0;
    if(mode === "Edit"){
      this.events.map(eventData => {
        if(eventData.shift.employeeId === event.shift.employeeId){
          const startDate = new Date(eventData.shift.startDate);
          const endDate = new Date(eventData.shift.endDate);
          totalInHours += ((<any>endDate - <any>startDate) /(1000*60*60)) - ( eventData.shift.break || 0 ) / 60 ;
        }
      });
      const startDate = new Date(event.shift.startDate);
      const endDate = new Date(event.shift.endDate);
      shiftLength = ((<any>endDate - <any>startDate) /(1000*60*60)) - ( event.shift.break || 0 ) / 60 ;
    }
    let shiftModal= this.modalCtrl.create(ShiftModalPage, {employees: this.getStoreEmployees(),
        start: event.start, shiftData: event.shift, totalInHours, shiftLength, mode}
    , {enableBackdropDismiss: false});
    shiftModal.onDidDismiss(
      async (data) => {
        if(data){
          if(data.status === "Dismiss"){
            return;
          }
          event.shift = data.shift || {};
          event.title = '<label>'+ data['empName'] + '</label>' + '<br>' +
              '<label>' + moment(data.shift['startDate']).format("hh:mm a") + ' - ' +
              moment(data.shift['endDate']).format("hh:mm a") + ' </label>';
          if(data.status === 'New'){
            this.events.push(event);
          }else if(data.status === 'Edit'){
            event.color = colors.yellow;
            event.isPublished = false;
            event.shift.status = ShiftStatus.Draft;
          }else if(data.status === 'Delete') {
            this.events = this.events.filter(event => event.shift._id !== data.shift._id);
          }

          await this.createOrUpdateShift(data.status, event.shift);
          this.viewDate = event.start;
          this.refresh.next();
          this.getUnpublishedShiftCount();
        }
      }
    );
    shiftModal.present();
  }
  private async createOrUpdateShift(type: string, shift){
    let shiftData = _.clone(shift);
    switch(type){
        case 'New':
          shiftData = await this.shiftService.add(shiftData);
          shift = {...shift, ...shiftData};
          break;
        case 'Edit':
          shiftData = await this.shiftService.update(shiftData);
          shift = {...shift, ...shiftData};
          break;
        case 'Delete':
          shiftData = await this.shiftService.delete(shiftData);
          break;
    }
  }
  /**
   * Get publish and unpublish count for shifts
   */
  public getUnpublishedShiftCount(): void {
    this.publishedCount = _.filter(this.events, { 'isPublished': true })['length'];
    this.unpublishedCount = _.filter(this.events, { 'isPublished': false })['length'];
  }

  /**
   * Get publish and unpublish count for shifts
   */

  /**
   * When shift is droped from employee list
   * @param Object pass CalendarEventTimesChangedEvent
   */
  public shiftDropped({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    let title;
    let eventId;
    if (event.hasOwnProperty('dropData') === true && event['dropData'] !== undefined && event['dropData'].event !== undefined) {
      event = event['dropData'].event;
    }
    // Update for the dropped date find the day on date
    if (event['workingDay'] !== undefined && event['workingDay'].day !== undefined) {
      eventId = event['shift']._id;
      event['workingDay'].day = daysOfWeek[moment(newStart).day()];
      title = '<label>'+ event['shift']['firstName'] +' '+ event['shift']['lastName'] + '</label>' + '<br><label>' + moment(event['workingDay']['openHours']['open']).format("hh:mm a") + ' - ' + moment(event['workingDay']['openHours']['close']).format("hh:mm a") + ' </label>';
    }
    if (event['other'] !== undefined && event['other']['workingDay'] !== undefined && event['other']['workingDay'].day !== undefined) {
      eventId = event['other']['shift']._id;
      event['other']['workingDay'].day = daysOfWeek[moment(newStart).day()];
      title = '<label>'+ event['other']['shift']['firstName'] +' '+ event['other']['shift']['lastName'] + '</label>' + '<br><label>' + moment(event['other']['workingDay']['openHours']['open']).format("hh:mm a") + ' - ' + moment(event['other']['workingDay']['openHours']['close']).format("hh:mm a") + ' </label>';
    }
    let isFound = false;    
    // update in shift array
    for (let obj of this.events) {
      if (obj.other.shift._id === eventId) {
        this.events = _.remove(this.events, (event) => {
          if (event.other.shift._id !== eventId) {
            return event;
          }
        });
        obj.start = newStart;
        obj.color = colors.yellow;
        obj.isPublished = false;
        if (newEnd) {
          obj.end = newEnd;
        }
        this.events.push(obj);
        this.viewDate = newStart;
        isFound = true;
      }
    }
    if (!isFound && event.hasOwnProperty('dropData') === false) {
      // Push shift as event list
      this.events.push({
        title: title,
        start: newStart,
        end: newEnd,
        color: colors.yellow,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true
        },
        other: event,
        isPublished: false
      });
    }
    
    this.refresh.next();
    this.getUnpublishedShiftCount();
  }

  /**
   * When event is clicked, open it in edit mode
   * @param event pass CalendarEvent
   */
  public eventClicked({ event }: { event: CalendarEvent }) {
    this.openShiftModal(event, 'Edit');
  }

  /** 
   * Set caledar to previous day
   */
  public prevDay(): void {
    let prevDate = moment({year: this.fromDate.year, month: this.fromDate.month, day: this.fromDate.day}).add(-1, 'days');
    this.fromDate.day   = prevDate.date();
    this.fromDate.month = prevDate.month();
    this.fromDate.year  = prevDate.year();
    this.dateRange      = prevDate.format('DD MMM');
  }

  /**
   * Set calendar to next day
   */
  public nextDay(): void {
    let netDate = moment({year: this.fromDate.year, month: this.fromDate.month, day: this.fromDate.day}).add(1, 'days');
    this.fromDate.day   = netDate.date();
    this.fromDate.month = netDate.month();
    this.fromDate.year  = netDate.year();
    this.dateRange      = netDate.format('DD MMM');
  }

  /** 
   * Set caledar to previous day
   */
  public prevWeek(): void {
    let firstDateOfWeek = moment({year: this.fromDate.year, month: this.fromDate.month-1, day: this.fromDate.day}).add(-1, 'weeks').day(1);
    let lastDateOfWeek = moment({year: this.fromDate.year, month: this.fromDate.month-1, day: this.fromDate.day}).add(-1, 'weeks').day(7);
    // Set FromDate
    this.fromDate['day']   = firstDateOfWeek.date();
    this.fromDate['month'] = firstDateOfWeek.month()+1;
    this.fromDate['year']  = firstDateOfWeek.year();
    this.viewDate = new Date(this.fromDate.year, this.fromDate.month-1, this.fromDate.day);
    // Set ToDate
    this.toDate = this.calendar.getToday();
    this.toDate['day']   = lastDateOfWeek.date();
    this.toDate['month'] = lastDateOfWeek.month()+1;
    this.toDate['year']  = lastDateOfWeek.year();
    // Display format string as range
    this.dateRange      = firstDateOfWeek.format('DD MMM') +'-'+ lastDateOfWeek.format('DD MMM');
  }

  /**
   * Set calendar to next day
   */
  public nextWeek(): void {
    let firstDateOfWeek = moment({year: this.fromDate.year, month: this.fromDate.month-1, day: this.fromDate.day}).add(1, 'weeks').day(1);
    let lastDateOfWeek = moment({year: this.fromDate.year, month: this.fromDate.month-1, day: this.fromDate.day}).add(1, 'weeks').day(7);
    // Set FromDate
    this.fromDate['day']   = firstDateOfWeek.date();
    this.fromDate['month'] = firstDateOfWeek.month()+1;
    this.fromDate['year']  = firstDateOfWeek.year();
    this.viewDate = new Date(this.fromDate.year, this.fromDate.month-1, this.fromDate.day);
    // Set ToDate
    this.toDate = this.calendar.getToday();
    this.toDate['day']   = lastDateOfWeek.date();
    this.toDate['month'] = lastDateOfWeek.month()+1;
    this.toDate['year']  = lastDateOfWeek.year();
    // Display format string as range
    this.dateRange      = firstDateOfWeek.format('DD MMM') +'-'+ lastDateOfWeek.format('DD MMM');
  }

  /**
   * Search employee
   */
  public searchEmployee(): void {
    //
    const employeeStoreList = this.getStoreEmployees();
    this.storeEmployees = _.filter(employeeStoreList, (emp)=> {

      let searchName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
      return searchName.indexOf(this.search.toLowerCase()) > -1;
    });
  }

  /**
   * Angular component life cycle event for component initialization
   */
  private getStoreEmployees(){
    return this.employees.filter(employee => {
        if(_.find(employee.store, {id: this.selectedStore._id})){
            return employee;
        }
    });
  }
  private getEmployeeName(employeeId){
    const employee = _.find(this.employees, {_id: employeeId})
    return `${employee.firstName} ${employee.lastName || ''}`;
  }

  public async ionViewDidLoad() {
    const loader = this.loading.create({ content: 'Loading Roster...'});
    await loader.present();
    // Fetch store list from data
    const [stores, employees] = await Promise.all([this.storeService.getAll(),
        this.employeeService.getAll() ]);
    this.stores = stores;
    this.employees = employees;
    this.selectedStore = this.stores[0];
    // this.events = events;
    await this.onStoreChange();
    this.refresh.next();
    await loader.dismiss();
  }


  public async onStoreChange(){
    const loader = this.loading.create({ content: 'Fetching Store Events...'});
    await loader.present();
    this.storeEmployees = this.getStoreEmployees();
    const events = await this.shiftService.getAllByStore(this.selectedStore._id);
    this.ngZone.run(() => {
      this.createShifts(events || []);
      this.refresh.next();
      this.getUnpublishedShiftCount();
    });
    await loader.dismiss();
  }

  /**
   * Angular component life cycle event for component destruction
   */
  public ngOnDestroy(): void {
    // Destroy NgZone reference when leaving component
    window["angularComponentRef"] = null;
  }

  /**
   * Select the range of current week
   */
  public jumpToCurrentWeek(): void {
    let firstDay = moment().day(1);
    this.fromDate['day'] = firstDay.date();
    this.fromDate['month'] = firstDay.month()+1;
    this.fromDate['year'] = firstDay.year();

    let lastDay = moment().day(7);
    this.toDate = this.calendar.getToday();
    this.toDate['day'] = lastDay.date();
    this.toDate['month'] = lastDay.month()+1;
    this.toDate['year'] = lastDay.year();

    let from = this.fromDate.month+'-'+this.fromDate.day+'-'+this.fromDate.year;
    let to = this.toDate.month+'-'+this.toDate.day+'-'+this.toDate.year;
    this.dateRange = moment(from).format('DD MMM') + ' - ' + moment(to).format('DD MMM');    
  }

  /**
   * Add new shift
   */
  public addNewShift(day: number): void {
    let createdOn = moment().day(day);
    let prepareEvent = {
      start: createdOn,
      title: 'title',
      end: undefined,
      color: colors.yellow,
      draggable: true,
      resizable: {
        beforeStart: true,
        afterEnd: true
      },
      shift: {
        storeId: this.selectedStore._id
      },
      isPublished: false
    }
    // open modal
    this.openShiftModal(prepareEvent, 'New');
  }
  private createShifts(shifts){
    this.events = shifts.map(shift => {
      const employeeName = this.getEmployeeName(shift.employeeId);
      return {
          start: moment(shift['startDate']),
          title: '<label>'+ employeeName + '</label>' + '<br>' +
          '<label>' + moment(shift['startDate']).format("hh:mm a") + ' - ' +
          moment(shift['endDate']).format("hh:mm a") + ' </label>',
          end: undefined,
          color: shift.status == ShiftStatus.Published ? colors.green : colors.yellow,
          draggable: true,
          resizable: {
              beforeStart: true,
              afterEnd: true
          },
          shift,
          isPublished: shift.status == ShiftStatus.Published
      }
    })

  }
  private async publishAllShifts(){
      const loader = this.loading.create({ content: 'Publishing shifts...'});
      await loader.present();
      const promises = this.events.map(event => {
          if(event.shift && event.shift._id && event.shift.status === ShiftStatus.Draft){
              event.isPublished = true;
              event.color = colors.green;
              event.shift.status = ShiftStatus.Published;
              return this.shiftService.update(event.shift);
          }
      });
      await Promise.all(promises);
      this.refresh.next();
      this.getUnpublishedShiftCount();
      loader.dismiss();
  }
  /**
   * This function will be invoked when date gets changed
   * @param date Provide date from UI
   */
  public onDateChange(date: NgbDateStruct) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
      this.dateRange = moment(this.fromDate.month+'-'+this.fromDate.day+'-'+this.fromDate.year).format('DD MMM');
    } else if (this.fromDate && !this.toDate && after(date, this.fromDate)) {
      this.toDate = date;
      let from = this.fromDate.month+'-'+this.fromDate.day+'-'+this.fromDate.year;
      let to = this.toDate.month+'-'+this.toDate.day+'-'+this.toDate.year;
      this.dateRange = moment(from).format('DD MMM') + ' - ' + moment(to).format('DD MMM');
    } else {
      this.toDate = null;
      this.fromDate = date;
      this.dateRange = moment(this.fromDate.month+'-'+this.fromDate.day+'-'+this.fromDate.year).format('DD MMM');
    }
    this.viewDate = new Date(this.fromDate.year, this.fromDate.month-1, this.fromDate.day);
  }

  /**
   * Calendar range selection dependencies from library
   */
  isHovered = date => this.fromDate && !this.toDate && this.hoveredDate && after(date, this.fromDate) && before(date, this.hoveredDate);
  isInside = date => after(date, this.fromDate) && before(date, this.toDate);
  isFrom = date => equals(date, this.fromDate);
  isTo = date => equals(date, this.toDate);
  
}
