import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { ConfigService } from '../modules/dataSync/services/configService';
import { UserService } from '../modules/dataSync/services/userService';
import { SalesSummaryList, SalesSummary } from '../model/SalesReportResponse';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SalesSummaryReportService {
	constructor(private http: HttpClient, private userService: UserService) { }

	public async getSalesSummary(currentPosId: string, fromDate: string, toDate: string) {
		let token = await this.userService.getAccessToken();
		return this.http
			.get(
				ConfigService.salesReportEndPoint() +
				`/?type=json&fromDate=${fromDate}&toDate=${toDate}&currentPosId=${currentPosId}&token=${token}`
			)
			.map((response: Response) => <SalesSummaryList>response.json());;
	}
}
