import { ConfigService } from './configService';
import { Injectable } from '@angular/core';
import { PlatformService } from './platformService';
import { EscPrinterProvider } from '../provider/escPrinterProvider';
import { EscPrinterConnectorProvider } from '../provider/escPrinterConnectorProvider';
import { ReceiptProvider } from '../provider/receiptProvider';
import { Parser } from 'htmlparser2';
import { Sale } from '../model/sale';
import { ReceiptProviderContext } from '../provider/ReceiptProviderContext';

@Injectable()
export class PrintService {
  static tcp: any;
  static socketId: string;

  constructor(private platformService: PlatformService) {
  }

  public async printReceipt(invoice: Sale) {
    if (!this.platformService.isMobileDevice()) {
      console.warn("can't print on dekstop");
      return;
    }
    
    var receiptProviderContext = new ReceiptProviderContext();
    receiptProviderContext.sale = invoice;
    receiptProviderContext.invoiceTitle = "Medi Hair";
    receiptProviderContext.shopName = "Barber shop in balgowlah";
    receiptProviderContext.phoneNumber = "(02) 8034 8891";
    receiptProviderContext.taxFileNumber = "49 864 355 835";
    receiptProviderContext.footerMessage = `<b>Tell us what you think</b>
    To provide feedback call us or goto medihair.com.au`;

    var receiptProvider = new ReceiptProvider(receiptProviderContext)
      .setHeader()
      .setBody()
      .setFooter();

    await new EscPrinterConnectorProvider(ConfigService.printerIP(), ConfigService.printerPort())
      .write(receiptProvider.getResult());
  }
}