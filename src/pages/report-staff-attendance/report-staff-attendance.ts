import { Component } from '@angular/core';
import { ReportModule } from '../../modules/reportModule';
import { PageModule } from '../../metadata/pageModule';
import { StaffAttendanceReportService } from '../../services/StaffAttendanceReportService';
import { StaffAttendance, Convert, Day } from '../../model/staffAttendance';
import { LoadingController } from 'ionic-angular';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { StoreService } from '../../services/storeService';
import { SyncContext } from '../../services/SyncContext';
import { DateTimeService } from '../../services/dateTimeService';
import { Employee } from 'model/employee';
import { EmployeeService } from '../../services/employeeService';

@SecurityModule(SecurityAccessRightRepo.ReportStaffAttendance)
@PageModule(() => ReportModule)
@Component({
	selector: 'page-report-staff-attendance',
	templateUrl: 'report-staff-attendance.html'
})
export class ReportStaffAttendancePage {
	public timeframes = [
		{ text: 'Week', value: 'WEEK' },
		{ text: 'Month', value: 'MONTH' },
		{ text: 'Custom', value: 'CUSTOM' }
	];
	public locations = [ { text: 'All locations', value: '' } ];
	public selectedTimeframe: string;
	public selectedStore: string;
	public staffAttendanceList: StaffAttendance;
	public days: Day[] = [];
	public employee: any[] = [];
	public reportGeneratedTime: Date;
	public fromDate: Date = new Date();
	public toDate: Date = new Date();
	public UTCDatePattern: string = 'YYYY-MM-DDTHH:mm:ssZ';
	public employeeIDs: string[] = [];
	public detailRowToShow = -1;
	public employees: Array<Employee> = [];

	constructor(
		private staffAttendanceReportService: StaffAttendanceReportService,
		private storeService: StoreService,
		private loading: LoadingController,
		private dateTimeService: DateTimeService,
		private employeeService: EmployeeService,
		private syncContext: SyncContext
	) {}

	async ionViewDidLoad() {
		this.fromDate.setDate(this.fromDate.getDate() - 15);
		this.selectedTimeframe = this.timeframes[1].value;
		const stores = await this.storeService.getAll();
		stores.forEach((store) => this.locations.push({ text: store.name, value: store._id }));
		this.employees = await this.employeeService.getAll();
		const storeId = this.syncContext.currentStore && this.syncContext.currentStore._id;
		this.selectedStore = storeId ? storeId : this.locations[0].value;

		await this.loadStaffAttendanceReport();
	}

	public async loadStaffAttendanceReport() {
		let loader = this.loading.create({ content: 'Loading Report...' });
		await loader.present();
		let toDate = new Date();
		let fromDate = new Date();
		let days = 7;

		if (this.selectedTimeframe === 'MONTH' || this.selectedTimeframe === 'WEEK') {
			this.selectedTimeframe === 'WEEK' && (days = 7);
			this.selectedTimeframe === 'MONTH' && (days = 30);
			fromDate.setDate(fromDate.getDate() - days);
		} else if (this.selectedTimeframe === 'CUSTOM') {
			fromDate = new Date(this.fromDate);
			toDate = new Date(this.toDate);
		}

		const callRest = await this.staffAttendanceReportService.getStaffAttendance(
			this.selectedStore,
			this.employeeIDs,
			this.dateTimeService.getUTCDate(fromDate).format(this.UTCDatePattern),
			this.dateTimeService.getUTCDate(toDate).format(this.UTCDatePattern)
		);
		callRest.subscribe(
			(staffAttendance) => {
				this.staffAttendanceList = <StaffAttendance>Convert.toStaffAttendance(staffAttendance);
				this.days = this.staffAttendanceList.days;
				this.employee =
					this.staffAttendanceList.days.length > 0 ? this.staffAttendanceList.days[0].Employee : [];
			},
			(err) => {
				console.log(err);
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
