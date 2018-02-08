import { Sale } from './../model/sale';
import _ from 'lodash';
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

  public async completePayment(sale: Sale, storeId: string, isRefund: boolean, payments?: number, paymentType?: string): Promise<any> {
    await this.salesService.updateStock(sale, storeId);
    sale.completed = true;
    sale.completedAt = moment().utc().format();
    sale.state = isRefund ? 'refund' : 'completed';
    sale.receiptNo = await this.fountainService.getReceiptNumber();

    return {
      normalSale: () => {
        if (isRefund) {
          sale.payments.push({
            type: paymentType,
            amount: Number(payments) * -1
          });
        }

        return sale;
      },
      fastCash: () => {
        sale.payments = [
          {
            type: 'cash',
            amount: Number(sale.items.length > 0 ? _.sumBy(sale.items, item => item.finalPrice * item.quantity) : 0)
          }
        ];

        return sale;
      }
    };
  }
}