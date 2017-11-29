import { ConfigService } from './configService';
import { Injectable } from '@angular/core';
import { PlatformService } from './platformService';
import { EscPrinterProvider } from '../provider/escPrinterProvider';
import { EscPrinterConnectorProvider } from '../provider/escPrinterConnectorProvider';
import { ReceiptProvider } from '../provider/receiptProvider';
import { Parser } from 'htmlparser2';

@Injectable()
export class PrintService {
  static tcp: any;
  static socketId: string;

  constructor(private platformService: PlatformService) {
  }

  public async print() {
    if (!this.platformService.isMobileDevice()) {
      console.warn("can't print on dekstop");
      return;
    }
    var printer = new EscPrinterProvider();

    new ReceiptProvider(printer)
      .setHeader()
      .setBody()
      .setFooter();

    printer.cut();

    new EscPrinterConnectorProvider(ConfigService.printerIP(), ConfigService.printerPort())
      .write(printer.getBuffer());
  }
}