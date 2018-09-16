import { Sale } from './../model/sale';
import * as moment from 'moment';
import { SalesServices } from './salesService';
import { Injectable } from '@angular/core';
import { FountainService } from './fountainService';

@Injectable()
export class PaymentService {

  constructor(
    private salesService: SalesServices,
    private fountainService: FountainService) {
  }

  public async completePayment(sale: Sale, storeId: string, isRefund: boolean): Promise<any> {
    await this.salesService.updateStock(sale, storeId);
    sale.completed = true;
    sale.completedAt = moment().utc().format();
    sale.completedAtLocalDate = moment().format();
    sale.state = isRefund ? 'refund' : 'completed';
    sale.receiptNo = await this.fountainService.getReceiptNumber();
  }
}