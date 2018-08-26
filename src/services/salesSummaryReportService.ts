import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { ConfigService } from '../modules/dataSync/services/configService';
import { UserService } from '../modules/dataSync/services/userService';
import { SalesSummaryList, SalesSummary } from '../model/SalesReportResponse';

@Injectable()
export class SalesSummaryReportService {
	constructor(private http: Http, private userService: UserService) { }

	public async getSalesSummary(currentPosId: string, fromDate: string, toDate: string) {
		let token = await this.userService.getUserToken();
		return this.http
			.get(
				ConfigService.salesReportEndPoint() +
				`/?type=json&fromDate=${fromDate}&toDate=${toDate}&currentPosId=${currentPosId}&token=${token}`
			)
			.map((response: Response) => <SalesSummaryList>response.json());;
	}
}
