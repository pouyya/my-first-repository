import { Sale } from './../model/sale';
import * as moment from 'moment';
import { SalesServices } from './salesService';
import { Injectable } from '@angular/core';
import { FountainService } from './fountainService';
import { DateTimeService } from './../services/dateTimeService';

@Injectable()
export class PaymentService {
  public UTCDatePattern: string = 'YYYY-MM-DDTHH:mm:ssZ';

  constructor(
    private salesService: SalesServices,
    private fountainService: FountainService,
    private dateTimeService: DateTimeService) {
  }

  public async completePayment(sale: Sale, storeId: string, isRefund: boolean): Promise<any> {
    await this.salesService.updateStock(sale, storeId);
    sale.completed = true;
    sale.completedAt = moment().utc().format();
    sale.completedAtLocalDate = this.dateTimeService.getTimezoneDate(new Date()).format(this.UTCDatePattern);
    sale.state = isRefund ? 'refund' : 'completed';
    sale.receiptNo = await this.fountainService.getReceiptNumber();
  }
}