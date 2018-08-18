// please dont press alt shift F in this service page
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { UserService } from '../modules/dataSync/services/userService';
import { ConfigService } from '../modules/dataSync/services//configService';

@Injectable()
export class StaffAttendanceReportService  {

    constructor(
        private http: Http, 
        private userService: UserService
    ) {
	}

    public async getStaffAttendance(storeId: string, employeeIDs : string[],fromDate: string, toDate: string) {
        let empIDs="''";
        if(employeeIDs.length>0){
            empIDs=employeeIDs.join(",");
        }
		return this.http
			.get(
                `${ConfigService.dotNetAppStaffAttendanceReport()}/?type=json&employeeIds=${empIDs}&fromDate=${fromDate}&toDate=${toDate}&storeId=${storeId}&token=${await this.userService.getUserToken()}`
			)
			.map((response: Response) => response.json());
    }
}
