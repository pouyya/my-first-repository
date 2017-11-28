import { ConfigService } from './configService';
import { Injectable } from '@angular/core';
import { PlatformService } from './platformService';
import { EscPrinterProvider } from '../provider/escPrinterProvider';
import { EscPrinterConnectorProvider } from '../provider/escPrinterConnectorProvider';

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
    printer.initialize();
    
    this.setHeader(printer);
    this.setBody(printer);
    this.setFooter(printer);

    printer.cut();

    new EscPrinterConnectorProvider(ConfigService.printerIP(), ConfigService.printerPort()).write(printer.getBuffer());
  }

  setHeader(printer: EscPrinterProvider) {
    printer.setJustification(EscPrinterProvider.JUSTIFY_CENTER);
    printer.setEmphasis(true);
    printer.setTextSize(1, 2);
    printer.text("Medi Hair\n");
    printer.setEmphasis(false);
    printer.setTextSize(1, 1);
    printer.feed();
    printer.text("Barber shop in Balgowlah\n");
    printer.text("Ph: (02) 8034 8891\n");
    printer.text("ABN: 49 864 355 835\n");
    printer.setJustification(EscPrinterProvider.JUSTIFY_LEFT);
    printer.text("TAX INVOICE");
    printer.text("    23/11/2017");
    printer.feed(2);
  }

  setBody(printer: EscPrinterProvider) {
    var items = [
      new PurchasedItem("Example item #1", "20.00", "$"),
      new PurchasedItem("Example item #2", "21.31", "$"),
      new PurchasedItem("Example item #1", "22.34", "$"),
      new PurchasedItem("Example item #1", "3.00", "$"),
      new PurchasedItem("Example item #1", "41.3", "$"),
      new PurchasedItem("Example item #1", "124.53", "$"),
      new PurchasedItem("Example item #1", "400.11", "$"),
      new PurchasedItem("Example item #1", "504.23", "$"),
    ];

    printer.setJustification(EscPrinterProvider.JUSTIFY_LEFT);
    for (let item of items) {
      printer.text(item.toString() + "\n");
    }

    printer.feed(2);
    printer.setTextSize(2, 1);
    printer.text("TOTAL            $113.05\n");
    printer.setTextSize(1, 1);
    printer.feed(2);
  }

  setFooter(printer: EscPrinterProvider) {
    printer.setJustification(EscPrinterProvider.JUSTIFY_CENTER);
    printer.barcode("ABC", EscPrinterProvider.BARCODE_CODE39);
    printer.text("23/11/2017 5:38 PM  PM82341234123\n");
    printer.setEmphasis(true);
    printer.text("Tell us what you think\n");
    printer.setEmphasis(false);
    printer.text("To provide feedback call us or goto medihair.com.au\n");
    printer.feed(4);
  }
}

class PurchasedItem {
  static leftColumn = 38;
  static righcolumn = 10;

  constructor(private name: string, private price: string, private currencySign: string) {
  }

  public toString(): string {
    return PurchasedItem.padRight(this.name, PurchasedItem.leftColumn) + PurchasedItem.padLeft(this.currencySign + this.price, PurchasedItem.righcolumn);
  }

  static padRight(value: string, size: number): string {
    while (value && value.length < size) value = value + " ";
    return value;
  }

  static padLeft(value: string, size: number): string {
    while (value && value.length < size) value = " " + value;
    return value;
  }
}