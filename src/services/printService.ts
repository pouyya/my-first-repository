import { Injectable } from '@angular/core';
import { PlatformService } from './platformService';
import { Sale } from '../model/sale';
import { TypeHelper } from '@simpleidea/simplepos-core/dist/utility/typeHelper';
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
    private translateService: TranslateService) {
  }

  public async printEndOfDayReport(closure: Closure, endOfDayReportType: EndOfDayReportType = EndOfDayReportType.PerProduct) {
    const receiptPrinters = this.getPrinterSales(null, DeviceType.ReceiptPrinter);
    if (!receiptPrinters.length) {
      return false;
    }
    var context = new EndOfDayProviderContext();
    context.openFloat = closure.openingAmount;
    context.posName = closure.posName;
    context.storeName = closure.storeName;
    context.openTime = closure.openTime;
    context.closeTime = closure.closeTime;
    context.cashIn = closure.totalCashIn;
    context.cashOut = closure.totalCashOut;
    context.cashCounted = closure.cashCounted;
    context.cashDifference = closure.cashDifference;
    context.ccCounted = closure.ccCounted;
    context.ccDifference = closure.ccDifference;
    context.totalCounted = closure.totalCounted;
    context.totalDifference = closure.totalDifference;
    context.employeeFullName = closure.employeeFullName;
    context.currentDateTime = new Date().toLocaleString();
    context.closureNumber = closure.closureNumber;
    context.dayItems = [];

    context.reportTitle = this.endOfDayReportSettings[endOfDayReportType].reportTitle;
    if (closure.sales) {
      for (let sale of closure.sales) {
        if (sale && sale.items) {
          for (let saleItem of sale.items) {

            var qty = saleItem.quantity || 0;
            var totalPrice = (saleItem.finalPrice || 0) * qty;

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

    var provider = new EndOfDayProvider(context);

    provider
      .setHeader()
      .setBody()
      .setFooter()
      .cutPaper();

    const promises = [];
    receiptPrinters.forEach(receiptPrinter => {
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


  public async printReceipt(sale: Sale) {
    if (!this.platformService.isMobileDevice()) {
      console.warn("can't print on dekstop");
      return;
    }

    const receiptPrinters = this.getPrinterSales(sale, DeviceType.ReceiptPrinter);
    if (receiptPrinters.length) {
      var currentAccountsetting = await this.accountSettingService.getCurrentSetting();

      const promises = [];
      receiptPrinters.forEach(receiptPrinter => {
        var receiptProviderContext = new ReceiptProviderContext();
        receiptProviderContext.sale = receiptPrinter.sale;
        receiptProviderContext.invoiceTitle = currentAccountsetting.name;
        receiptProviderContext.shopName = this.syncContext.currentStore.name;
        receiptProviderContext.phoneNumber = this.syncContext.currentStore.phone;
        receiptProviderContext.taxFileNumber = this.syncContext.currentStore.taxFileNumber;
        receiptProviderContext.footerMessage = currentAccountsetting.receiptFooterMessage;

        var receiptProvider = new ReceiptProvider(receiptProviderContext, this.translateService)
          .setHeader()
          .setBody()
          .setFooter()
          .cutPaper();

        promises.push(new EscPrinterConnectorProvider(receiptPrinter.printer.ipAddress, receiptPrinter.printer.printerPort)
          .write(receiptProvider.getResult()));
      });

      await Promise.all(promises);
    }
  }

  private getPrinterSales(sale: Sale, deviceType: DeviceType) {
    const printers = this.syncContext.currentStore.devices.filter(device => device.type == deviceType);
    const printerSales = [];
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
    return printerSales;
  }

  public async printProductionLinePrinter(sale: Sale) {
    if (!this.platformService.isMobileDevice()) {
      console.warn("can't print on dekstop");
      return;
    }

    const currentAccountsettings = await this.accountSettingService.getCurrentSetting();
    const printerSales = this.getPrinterSales(sale, DeviceType.ProductionLinePrinter);
    printerSales.forEach(printerSale => {
      const productionLinePrinterProviderContext = new ProductionLinePrinterProviderContext();
      productionLinePrinterProviderContext.sale = printerSale.sale;
      productionLinePrinterProviderContext.invoiceTitle = currentAccountsettings.name;
      productionLinePrinterProviderContext.shopName = this.syncContext.currentStore.name;
      productionLinePrinterProviderContext.phoneNumber = this.syncContext.currentStore.phone;
      productionLinePrinterProviderContext.taxFileNumber = this.syncContext.currentStore.taxFileNumber;
      productionLinePrinterProviderContext.footerMessage = currentAccountsettings.receiptFooterMessage;

      var productionLinePrinterProvider = new ProductionLinePrinterProvider(productionLinePrinterProviderContext, this.translateService)
        .setHeader()
        .setBody()
        .setFooter()
        .cutPaper();

      new EscPrinterConnectorProvider(printerSale.printer.ipAddress, printerSale.printer.printerPort)
        .write(productionLinePrinterProvider.getResult());
    });
  }

  public async openCashDrawer() {

    if (!this.platformService.isMobileDevice()) {
      console.warn("can't print on dekstop");
      return;
    }

    const receiptPrinters = this.getPrinterSales(null, DeviceType.ReceiptPrinter);

    if (receiptPrinters.length) {
      const promises = [];
      receiptPrinters.forEach(receiptPrinter => {
        promises.push(new EscPrinterConnectorProvider(receiptPrinter.printer.ipAddress, receiptPrinter.printer.printerPort)
          .write(new ReceiptProvider(null, this.translateService).openCashDrawer().getResult()));
      });
      await Promise.all(promises);
    }
  }
}