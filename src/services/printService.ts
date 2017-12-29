import { Injectable } from '@angular/core';
import { PlatformService } from './platformService';
import { Sale } from '../model/sale';
import { StoreService } from './storeService';
import { PosService } from './posService';
import { AccountSettingService } from './accountSettingService';
import { TypeHelper } from '../utility/typeHelper';
import { EndOfDayProvider } from '../provider/print/endOfDay/endOfDayProvider';
import { EndOfDayProviderContext } from '../provider/print/endOfDay/endOfDayProviderContext';
import { EscPrinterConnectorProvider } from '../provider/print/escPrinterConnectorProvider';
import { Closure } from '../model/closure';
import { ReceiptProviderContext } from '../provider/print/receipt/ReceiptProviderContext';
import { ReceiptProvider } from '../provider/print/receipt/receiptProvider';

@Injectable()
export class PrintService {
  static tcp: any;
  static socketId: string;

  constructor(
    private platformService: PlatformService,
    private storeService: StoreService,
    private posService: PosService,
    private accountSettingService: AccountSettingService) {
  }

  public async printEndOfDayReport(closure: Closure) {

    var currentStore = await this.storeService.get(closure.storeId);

    var context = new EndOfDayProviderContext();
    context.openFloat = closure.openingAmount
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

    if (closure.sales) {
      closure.sales.forEach((invoice) => {
        if (invoice && invoice.items) {
          invoice.items.forEach((invoiceItem => {

            var qty = invoiceItem.quantity || 0;
            var totalPrice = (invoiceItem.finalPrice || 0) * qty;

            if (!context.dayItems[invoiceItem._id]) {
              context.dayItems[invoiceItem._id] = { name: invoiceItem.name, totalPrice: totalPrice, totalQuantity: qty };
            } else {
              context.dayItems[invoiceItem._id].totalPrice += totalPrice || 0;
              context.dayItems[invoiceItem._id].totalQuantity += qty || 0;
            }

          }));
        }
      });
    }

    var provider = new EndOfDayProvider(context);

    provider
      .setHeader()
      .setBody()
      .setFooter()
      .cutPaper();

    await new EscPrinterConnectorProvider(currentStore.printerIP, currentStore.printerPort)
      .write(provider.getResult());
  }

  public async printReceipt(invoice: Sale, openCashDrawer: boolean) {
    if (!this.platformService.isMobileDevice()) {
      console.warn("can't print on dekstop");
      return;
    }

    var currentStore = await this.storeService.getCurrentStore();

    if (!TypeHelper.isNullOrWhitespace(currentStore.printerIP) && !TypeHelper.isNullOrWhitespace(currentStore.printerPort)) {

      var pos = await this.posService.get(invoice.posID);
      var store = await this.storeService.get(pos.storeId);
      var currentAccountsetting = await this.accountSettingService.getCurrentSetting();

      var receiptProviderContext = new ReceiptProviderContext();
      receiptProviderContext.sale = invoice;
      receiptProviderContext.invoiceTitle = currentAccountsetting.name;
      receiptProviderContext.shopName = store.name;
      receiptProviderContext.phoneNumber = store.phone;
      receiptProviderContext.taxFileNumber = store.taxFileNumber;
      receiptProviderContext.footerMessage = currentAccountsetting.receiptFooterMessage;

      var receiptProvider = new ReceiptProvider(receiptProviderContext)
        .setHeader()
        .setBody()
        .setFooter()
        .cutPaper();

      if (openCashDrawer) {
        receiptProvider = receiptProvider.openCashDrawer();
      }

      await new EscPrinterConnectorProvider(currentStore.printerIP, currentStore.printerPort)
        .write(receiptProvider.getResult());
    }
  }
}