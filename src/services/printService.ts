import { Injectable } from '@angular/core';
import { PlatformService } from './platformService';
import { EscPrinterConnectorProvider } from '../provider/escPrinterConnectorProvider';
import { ReceiptProvider } from '../provider/receiptProvider';
import { Sale } from '../model/sale';
import { ReceiptProviderContext } from '../provider/ReceiptProviderContext';
import { StoreService } from './storeService';
import { PosService } from './posService';
import { AccountSettingService } from './accountSettingService';
import { TypeHelper } from '../utility/typeHelper';

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

  public async printReceipt(invoice: Sale) {
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
        .setFooter();

      await new EscPrinterConnectorProvider(currentStore.printerIP, currentStore.printerPort)
        .write(receiptProvider.getResult());
    }
  }
}