import { Injectable } from '@angular/core';
import { PlatformService } from './platformService';
import { Sale } from '../model/sale';
import { TypeHelper } from '@simplepos/core/dist/utility/typeHelper';
import { EndOfDayProvider } from '../provider/print/endOfDay/endOfDayProvider';
import { EndOfDayProviderContext } from '../provider/print/endOfDay/endOfDayProviderContext';
import { EscPrinterConnectorProvider } from '../provider/print/escPrinterConnectorProvider';
import { Closure } from '../model/closure';
import { ReceiptProviderContext } from '../provider/print/receipt/receiptProviderContext';
import { ReceiptProvider } from '../provider/print/receipt/receiptProvider';
import { EmployeeService } from './employeeService';
import { CategoryService } from './categoryService';
import { BasketItem } from '../model/basketItem';
import { AccountSettingService } from '../modules/dataSync/services/accountSettingService';
import { SyncContext } from "./SyncContext";
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';
import { DeviceType } from "../model/store";
import { ProductionLinePrinterProviderContext } from "../provider/print/productionLine/productionLinePrinterProviderContext";
import { ProductionLinePrinterProvider } from "../provider/print/productionLine/productionLinePrinterProvider";
import { EscPrinterProvider, PrinterWidth } from '../provider/print/escPrinterProvider';
import {Utilities} from "../utility";

export enum EndOfDayReportType {
  PerProduct,
  PerCategory,
  PerEmployee
}


@Injectable()
export class PrintService {
  static tcp: any;
  static socketId: string;
  private endOfDayReportSettings = {
    [EndOfDayReportType.PerCategory]: {
      reportTitle: "End Of Day Report - Per Category",
      saleItemGetter: this.getPerCategory.bind(this)
    },
    [EndOfDayReportType.PerEmployee]: {
      reportTitle: "End Of Day Report - Per Employee",
      saleItemGetter: this.getPerEmployee.bind(this)
    },
    [EndOfDayReportType.PerProduct]: {
      reportTitle: "End Of Day Report - Per Product",
      saleItemGetter: this.getPerProduct.bind(this)
    }
  }

  constructor(
    private platformService: PlatformService,
    private accountSettingService: AccountSettingService,
    private employeeService: EmployeeService,
    private categoryService: CategoryService,
    private syncContext: SyncContext,
    private translateService: TranslateService,
    private utility: Utilities) {
  }

  public async printEndOfDayReport(closure: Closure, endOfDayReportType: EndOfDayReportType = EndOfDayReportType.PerProduct) {
    const receiptPrinters = this.getPrinterSales(null, DeviceType.ReceiptPrinter);
    if (!receiptPrinters.length) {
      return false;
    }
    const context = new EndOfDayProviderContext();
    context.openFloat = closure.openingAmount;
    context.posName = closure.posName;
    context.storeName = closure.storeName;
    context.openTime = this.utility.convertTimezone(closure.openTime).toString();
    context.closeTime = this.utility.convertTimezone(closure.closeTime).toString();
    context.cashIn = closure.totalCashIn;
    context.cashOut = closure.totalCashOut;
    context.cashCounted = closure.cashCounted;
    context.cashDifference = closure.cashDifference;
    context.ccCounted = closure.ccCounted;
    context.ccDifference = closure.ccDifference;
    context.totalCounted = closure.totalCounted;
    context.totalDifference = closure.totalDifference;
    context.employeeFullName = closure.employeeFullName;
    context.currentDateTime = this.utility.convertTimezone(new Date()).toString();
    context.closureNumber = closure.closureNumber;
    context.dayItems = [];

    context.reportTitle = this.endOfDayReportSettings[endOfDayReportType].reportTitle;
    if (closure.sales) {
      for (let sale of closure.sales) {
        if (sale && sale.items) {
          for (let saleItem of sale.items) {

            const qty = saleItem.quantity || 0;
            const totalPrice = (saleItem.finalPrice || 0) * qty;

            let id: string;
            let name: string;

            ({ id, name } = await this.endOfDayReportSettings[endOfDayReportType].saleItemGetter(saleItem));

            if (!context.dayItems[id]) {
              context.dayItems[id] = { name: name, totalPrice: totalPrice, totalQuantity: qty };
            } else {
              context.dayItems[id].totalPrice += totalPrice || 0;
              context.dayItems[id].totalQuantity += qty || 0;
            }
          }
        }
      }
    }

    const promises = [];
    receiptPrinters.forEach(receiptPrinter => {

      let printerProvider = new EscPrinterProvider(receiptPrinter.printer.characterPerLine == 42 ? PrinterWidth.Narrow : PrinterWidth.Wide);
      let provider = new EndOfDayProvider(context, printerProvider);

      provider
        .setHeader()
        .setBody()
        .setFooter()
        .cutPaper();

      promises.push(new EscPrinterConnectorProvider(receiptPrinter.printer.ipAddress, receiptPrinter.printer.printerPort)
        .write(provider.getResult()));
    });

    await Promise.all(promises);
  }

  private getPerProduct(saleItem: BasketItem) {
    var id = saleItem.purchsableItemId;
    var name = saleItem.name;
    return { id, name };
  }

  private async getPerEmployee(saleItem: BasketItem) {
    var id = saleItem.employeeId;
    var name = 'NO EMPLOYEE SELECTED';

    if (id) {
      var employee = await this.employeeService.get(id);
      name = `${employee.firstName} ${employee.lastName}`;
    }
    else {
      id = "NA";
    }

    return { id, name };
  }

  private async getPerCategory(saleItem: BasketItem) {
    var id = saleItem.categoryId;
    var name = "NO CATEGORY";

    if (id) {
      var category = await this.categoryService.get(id);
      if (category && category.name) {
        name = category.name;
      }
    } else {
      id = "NA";
    }

    return { id, name };
  }


  public async printReceipt(sale: Sale): Promise<any> {
    if (!this.platformService.isMobileDevice()) {
      console.warn("can't print on dekstop");
      return;
    }

    const receiptPrinters = this.getPrinterSales(sale, DeviceType.ReceiptPrinter);
    if (receiptPrinters.length) {
      var currentAccountsetting = await this.accountSettingService.getCurrentSetting();

      const promises = [];
      receiptPrinters.forEach(receiptPrinter => {
        const receiptProviderContext = new ReceiptProviderContext();
        receiptProviderContext.sale = receiptPrinter.sale;
        receiptProviderContext.invoiceTitle = currentAccountsetting.name;
        receiptProviderContext.shopName = this.syncContext.currentStore.name;
        receiptProviderContext.phoneNumber = this.syncContext.currentStore.phone;
        receiptProviderContext.taxFileNumber = this.syncContext.currentStore.taxFileNumber;
        receiptProviderContext.footerMessage = this.syncContext.currentStore.receiptFooterMessage || currentAccountsetting.receiptFooterMessage;

        const printerProvider = new EscPrinterProvider(receiptPrinter.printer.characterPerLine == 42 ? PrinterWidth.Narrow : PrinterWidth.Wide);
        const receiptProvider = new ReceiptProvider(receiptProviderContext, this.translateService, printerProvider)
          .setHeader()
          .setBody()
          .setFooter()
          .cutPaper();

        promises.push(new EscPrinterConnectorProvider(receiptPrinter.printer.ipAddress, receiptPrinter.printer.printerPort)
          .write(receiptProvider.getResult()));
      });

      return Promise.all(promises);
    }
  }

  private getPrinterSales(sale: Sale, deviceType: DeviceType) {
    const printerSales = [];
    if (this.syncContext.currentStore.devices) {
      const printers = this.syncContext.currentStore.devices.filter(device => device.type == deviceType);
      printers.forEach(printer => {
        if (TypeHelper.isNullOrWhitespace(printer.ipAddress) || TypeHelper.isNullOrWhitespace(printer.printerPort) ||
          (printer.posIds && printer.posIds.length && printer.posIds.indexOf(this.syncContext.currentPos.id) == -1)) {
          return;
        }
        let items = [];
        if (sale) {
          if (!printer.associatedPurchasableItemIds || !printer.associatedPurchasableItemIds.length) {
            items = sale.items;
          } else {
            items = sale.items.filter(item => printer.associatedPurchasableItemIds.indexOf(item.purchsableItemId) !== -1);
          }
        }
        if (items.length) {
          const newSale = _.cloneDeep(sale);
          newSale.items = items;
          printerSales.push({ printer, sale: newSale });
        } else if (!sale) {
          printerSales.push({ printer });
        }
      });
    }
    return printerSales;
  }

  public async printProductionLinePrinter(sale: Sale): Promise<any> {
    if (!this.platformService.isMobileDevice()) {
      console.warn("can't print on dekstop");
      return;
    }
    sale.items = sale.items.filter(item => {
      const count = item.quantity - item.printedProductionLineCount;
      item.quantity = count;
      return count;
    });
    const productionLinePrinters = this.getPrinterSales(sale, DeviceType.ProductionLinePrinter);
    const promises = [];
    productionLinePrinters.forEach(productionLinePrinter => {
      const productionLinePrinterProviderContext = new ProductionLinePrinterProviderContext();
      productionLinePrinterProviderContext.sale = productionLinePrinter.sale;

      const printerProvider = new EscPrinterProvider(productionLinePrinter.printer.characterPerLine == 42 ? PrinterWidth.Narrow : PrinterWidth.Wide);

      const productionLinePrinterProvider = new ProductionLinePrinterProvider(productionLinePrinterProviderContext, printerProvider)
        .setHeader()
        .setBody()
        .cutPaper();

      promises.push(new EscPrinterConnectorProvider(productionLinePrinter.printer.ipAddress, productionLinePrinter.printer.printerPort)
        .write(productionLinePrinterProvider.getResult()));
    });

    return Promise.all(promises);
  }

  public async openCashDrawer(): Promise<any> {

    if (!this.platformService.isMobileDevice()) {
      console.warn("can't print on dekstop");

      return;
    }

    const receiptPrinters = this.getPrinterSales(null, DeviceType.ReceiptPrinter);

    if (receiptPrinters.length) {
      const promises = [];
      receiptPrinters.forEach(receiptPrinter => {
        const printerProvider = new EscPrinterProvider(receiptPrinter.printer.characterPerLine == 42 ? PrinterWidth.Narrow : PrinterWidth.Wide);
        promises.push(new EscPrinterConnectorProvider(receiptPrinter.printer.ipAddress, receiptPrinter.printer.printerPort)
          .write(new ReceiptProvider(null, this.translateService, printerProvider).openCashDrawer().getResult()));
      });

      return Promise.all(promises);
    }
  }
}