// please dont press alt shift F in this service page
import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { UserService } from '../modules/dataSync/services/userService';
import { ConfigService } from '../modules/dataSync/services//configService';
import { StaffAttendance, Day } from '../model/staffAttendance';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class StaffAttendanceReportService {

    constructor(
        private http: HttpClient,
        private userService: UserService
    ) {
    }

    public async getStaffAttendance(storeId: string, employeeIDs: string[], fromDate: string, toDate: string) {
        let empIDs = "''";
        if (employeeIDs.length > 0) {
            empIDs = employeeIDs.join(",");
        }
        let token = await this.userService.getAccessToken();
        return this.http
            .get(
                `${ConfigService.staffAttendanceReport()}/?type=json&employeeIds=${empIDs}&fromDate=${fromDate}&toDate=${toDate}&storeId=${storeId}&token=${token}`
            )
            .map((response: Response) => <StaffAttendance>response.json());
    }
}
