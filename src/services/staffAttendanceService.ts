// please dont press alt shift F in this service page
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { UserService } from '../modules/dataSync/services/userService';
import { ConfigService } from '../modules/dataSync/services//configService';

@Injectable()
export class StaffAttendanceService  {

    constructor(
        private http: Http, 
        private userService: UserService
    ) {
	}

    public async getStaffAttendance(storeId: string, fromDate: string, toDate: string) {
		return this.http
			.get(
                `${ConfigService.dotNetAppStaffAttendanceReport()}/?type=json&employeeIds=2018-01-02T06:00:59.9610000,2018-01-02T06:00:59.9610000&fromDate=${fromDate}&toDate=${toDate}&storeId=${storeId}&token=${await this.userService.getUserToken()}`
			)
			.map((response: Response) => response.json());
    }
}
