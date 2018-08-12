import { Component } from '@angular/core';
import { ReportModule } from '../../modules/reportModule';
import { PageModule } from '../../metadata/pageModule';
import { StaffAttendanceService , StaffAttendance ,Convert , Day , Employee , Attendance, AttendanceDetail} from "../../services/staffAttendanceService";
import { LoadingController } from "ionic-angular";
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { StoreService } from "../../services/storeService";
import { SyncContext } from '../../services/SyncContext';

@SecurityModule(SecurityAccessRightRepo.ReportStockMovementSummary)
@PageModule(() => ReportModule)
@Component({
  selector: 'page-report-staff-attendance',
  templateUrl: 'report-staff-attendance.html',
})
export class ReportStaffAttendancePage {

  public timeframes = [{ text: "Week", value: "WEEK" }, { text: "Month", value: "MONTH" }, { text: "Custom", value: "CUSTOM" }];
  public locations = [{ text: "All locations", value: "" }];
  public selectedTimeframe: string;
  public selectedStore: string;
  public stockMovementList: StaffAttendance;
  public days: Day[]=[];
  public employee: Employee[]=[];
  public reportGeneratedTime: Date;
  public fromDate: Date = new Date();
  public toDate: Date = new Date();

  constructor(private staffAttendanceService: StaffAttendanceService,
    private storeService: StoreService,
    private loading: LoadingController,
    private syncContext: SyncContext) {
  }

  async ionViewDidLoad() {
    this.fromDate.setDate(this.fromDate.getDate() - 15);
    this.selectedTimeframe = this.timeframes[0].value;
    const stores = await this.storeService.getAll();
    stores.forEach(store => this.locations.push({ text: store.name, value: store._id }));

    const storeId = this.syncContext.currentStore && this.syncContext.currentStore._id;
    this.selectedStore = (storeId)?storeId:this.locations[0].value;

    await this.loadStockReport();
  }

  public async loadStockReport() {
    let loader = this.loading.create({ content: 'Loading Report...', });
    await loader.present();
    let toDate = new Date();
    let fromDate = new Date();
    let days = 7;

    if (this.selectedTimeframe === "MONTH" || this.selectedTimeframe === "WEEK") {
      this.selectedTimeframe === "WEEK" && (days = 7);
      this.selectedTimeframe === "MONTH" && (days = 30);
      fromDate.setDate(fromDate.getDate() - days);
    } else if (this.selectedTimeframe === "CUSTOM") {

      fromDate = new Date(this.fromDate);
      toDate = new Date(this.toDate);

    }

    var stockMovement = await this.staffAttendanceService.getStaffAttendance(this.selectedStore, fromDate, toDate);
    stockMovement.subscribe(
      stockMovementList => {
        this.stockMovementList = <StaffAttendance>Convert.toStaffAttendance(stockMovementList);
        this.days=this.stockMovementList.days;
        this.employee=this.stockMovementList.days[0].Employee;
      },
      err => {
        console.log(err);
        loader.dismiss();
      },
      () => loader.dismiss()
    );
    this.reportGeneratedTime = new Date();
  }

  onButtonClick(item)
  {
    let row = document.getElementById( item.currentTarget.id)
    row.getElementsByTagName('div')[0].hidden=!row.getElementsByTagName('div')[0].hidden;
  } 
}
