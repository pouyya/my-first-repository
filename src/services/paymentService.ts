import { Sale } from './../model/sale';
import { SalesServices } from './salesService';
import { Injectable } from '@angular/core';
import { FountainService } from './fountainService';
import { DateTimeService } from './../services/dateTimeService';

@Injectable()
export class PaymentService {

  constructor(
    private salesService: SalesServices,
    private fountainService: FountainService,
    private dateTimeService: DateTimeService) {
  }

  public async completePayment(sale: Sale, storeId: string, isRefund: boolean): Promise<any> {
    await this.salesService.updateStock(sale, storeId);
    sale.completed = true;
    sale.completedAt = this.dateTimeService.getUTCDateString();
    sale.completedAtLocalDate = this.dateTimeService.getLocalDateString();
    sale.state = isRefund ? 'refund' : 'completed';
    sale.receiptNo = await this.fountainService.getReceiptNumber();
  }
}