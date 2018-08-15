import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { ConfigService } from '../modules/dataSync/services/configService';
import { UserService } from '../modules/dataSync/services/userService';

@Injectable()
export class SalesSummaryReportService {
	constructor(private http: Http, private userService: UserService) {}

	public async getDashboard(currentPosId: string, fromDate: string, toDate: string) {
	return this.http
			.get(
				ConfigService.salesReportEndPoint() +
					`/?type=json&fromDate=${fromDate}&toDate=${toDate}&currentPosId=${currentPosId}&token=${await this.userService.getUserToken()}`
			)
			.map((response: Response) => response.json());
	}
}
