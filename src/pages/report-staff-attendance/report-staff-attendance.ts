import { Component } from '@angular/core';
import { ReportModule } from '../../modules/reportModule';
import { PageModule } from '../../metadata/pageModule';
import { StaffAttendanceReportService } from '../../services/StaffAttendanceReportService';
import { StaffAttendance, Day } from '../../model/staffAttendance';
import { LoadingController } from 'ionic-angular';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { StoreService } from '../../services/storeService';
import { SyncContext } from '../../services/SyncContext';
import { DateTimeService } from '../../services/dateTimeService';
import { Employee } from 'model/employee';
import { EmployeeService } from '../../services/employeeService';
import { Subject } from 'rxjs';

@SecurityModule(SecurityAccessRightRepo.ReportStaffAttendance)
@PageModule(() => ReportModule)
@Component({
	selector: 'page-report-staff-attendance',
	templateUrl: 'report-staff-attendance.html'
})
export class ReportStaffAttendancePage {
	public locations = [{ text: 'All locations', value: '' }];
	public selectedTimeframe: string;
	private dates$: Subject<Object> = new Subject<Object>();
	public selectedStore: string;
	public staffAttendanceList: StaffAttendance;
	public days: Day[] = [];
	public employee: any[] = [];
	public reportGeneratedTime: Date;
	public fromDate: Date = new Date();
	public toDate: Date = new Date();
	public employeeIDs: string[] = [];
	public detailRowToShow = -1;
	public employees: Array<Employee> = [];
	public emptyReportWarning = false;

	constructor(
		private staffAttendanceReportService: StaffAttendanceReportService,
		private storeService: StoreService,
		private loading: LoadingController,
		private dateTimeService: DateTimeService,
		private employeeService: EmployeeService,
		private syncContext: SyncContext
	) { }

	async ionViewDidLoad() {
		this.fromDate.setDate(this.fromDate.getDate() - 15);
		const stores = await this.storeService.getAll();
		stores.forEach((store) => this.locations.push({ text: store.name, value: store._id }));
		this.employees = await this.employeeService.getAll();
		const storeId = this.syncContext.currentStore && this.syncContext.currentStore._id;
		this.selectedStore = storeId ? storeId : this.locations[0].value;

		this.dates$.asObservable().subscribe(async (date: any) => {
			this.fromDate = date.fromDate;
			this.toDate = date.toDate;
			await this.loadStaffAttendanceReport();
		});

		let fromDate = new Date(), toDate = new Date();
		fromDate.setHours(0, 0, 0, 0);
		fromDate.setDate(fromDate.getDate() - 7);
		this.dates$.next({ fromDate, toDate });
	}

	public async loadStaffAttendanceReport() {
		this.emptyReportWarning = false;
		let loader = this.loading.create({ content: 'Loading Report...' });
		await loader.present();

		this.fromDate.setHours(0, 0, 0, 0);
		this.toDate.setHours(23, 59, 59, 0);

		const callRest = await this.staffAttendanceReportService.getStaffAttendance(
			this.selectedStore,
			this.employeeIDs,
			this.dateTimeService.getLocalISOString(this.fromDate),
			this.dateTimeService.getLocalISOString(this.toDate));

		callRest.subscribe(
			(staffAttendanceList) => {
				this.staffAttendanceList = staffAttendanceList;
				this.days = this.staffAttendanceList.days;
				this.employee =
					this.staffAttendanceList.days.length > 0 ? this.staffAttendanceList.days[0].Employee : [];
			},
			(err) => {
				console.log(err);
				if (err.status == 0)
					this.emptyReportWarning = true;
				loader.dismiss();
			},
			() => loader.dismiss()
		);
		this.reportGeneratedTime = new Date();
	}

	onButtonClick(idrow) {
		this.detailRowToShow = idrow;
	}
}
