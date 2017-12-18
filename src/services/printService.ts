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

  public async printEndOfDayReport(closure: Closure){

    var currentStore = await this.storeService.get(closure.storeId);

    var context = new EndOfDayProviderContext();
    context.openFloat = closure
    context.posName = closure.posName;
    context.storeName = closure.storeName;
    context.openTime = closure.openTime;
    context.closeTime = closure.closeTime;
    context.currentDateTime = new Date().toLocaleString();
    context.closureNumber = closure.closureNumber;
    var provider = new EndOfDayProvider(context);

    provider.setHeader();

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