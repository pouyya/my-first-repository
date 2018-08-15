import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { ConfigService } from '../modules/dataSync/services/configService';
import { UserService } from '../modules/dataSync/services/userService';

@Injectable()
export class SalesSummaryReportService {
	constructor(private http: Http, private userService: UserService) {}

	public async getDashboard(currentPosId: string, fromDate: Date, toDate: Date) {
		let fromDateMonth: string =
			fromDate.getMonth() + 1 > 9 ? fromDate.getMonth() + 1 + '' : '0' + (fromDate.getMonth() + 1);
		let fromDateDay: string = fromDate.getDate() > 9 ? fromDate.getDate() + '' : '0' + fromDate.getDate();
		let toDateMonth: string =
			toDate.getMonth() + 1 > 9 ? toDate.getMonth() + 1 + '' : '0' + (toDate.getMonth() + 1);
		let toDateDay: string = toDate.getDate() > 9 ? toDate.getDate() + '' : '0' + toDate.getDate();
		return this.http
			.get(
				ConfigService.salesReportEndPoint() +
					`/?type=json&fromDate=${fromDate.getFullYear()}-${fromDateMonth}-${fromDateDay}&toDate=${toDate.getFullYear()}-${toDateMonth}-${toDateDay}&currentPosId=${currentPosId}&token=${await this.userService.getUserToken()}`
			)
			.map((response: Response) => response.json());
	}
}
