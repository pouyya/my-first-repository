import { EscPrinterProvider } from "../escPrinterProvider";
import { HtmlPrinterProvider } from "../htmlPrinterProvider";
import { DeviceReceiptProviderContext } from "./deviceReceiptProviderContext";
import { TypeHelper } from "@simpleidea/simplepos-core/dist/utility/typeHelper";
import { TranslateService } from "@ngx-translate/core";

export class DeviceReceiptProvider {

    printer: EscPrinterProvider;
    htmlPrinterProvider: HtmlPrinterProvider;

    constructor(
        public deviceReceiptProviderContext: DeviceReceiptProviderContext,
        private translateService: TranslateService) {
        this.printer = new EscPrinterProvider();
        this.htmlPrinterProvider = new HtmlPrinterProvider(this.printer);
    }

    setHeader(): DeviceReceiptProvider {
        var headerHtml = `
        <center>
            <h2><b>${this.deviceReceiptProviderContext.invoiceTitle}</b></h2>${this.deviceReceiptProviderContext.shopName}
Ph: ${this.deviceReceiptProviderContext.phoneNumber}
${this.translateService.instant('TaxFileNumber')}: ${this.deviceReceiptProviderContext.taxFileNumber}
        </center>
        <table cols="left-24,right-24">
            <tr>
                <td>TAX INVOICE</td>
                <td>${new Date(this.deviceReceiptProviderContext.sale.completedAt).toLocaleString()}</td>
            </tr>
        </table>
        <br>
        <br>`;

        this.htmlPrinterProvider.parse(headerHtml);

        return this;
    }

    setBody(): DeviceReceiptProvider {
        var basketItems = "";
        if (this.deviceReceiptProviderContext.sale.items) {
            basketItems += '<table cols="left-4,left-34,right-10">';

            for (let basketItem of this.deviceReceiptProviderContext.sale.items) {
                basketItems += `<tr>
                            <td>${basketItem.quantity}</td>
                            <td>${TypeHelper.encodeHtml(basketItem.name)}</td>
                        </tr>`;
            }

            basketItems += `</table>
            <hr>
            <br>
            <br>`;
        }

        var bodyHtml = `${basketItems}`;

        this.htmlPrinterProvider.parse(bodyHtml);

        return this;
    }

    setFooter(): DeviceReceiptProvider {

        var footerHtml = `
        <center>
            <barcode>${this.deviceReceiptProviderContext.sale.receiptNo}</barcode>
${new Date(this.deviceReceiptProviderContext.sale.completedAt).toLocaleString()}  ${this.deviceReceiptProviderContext.sale.receiptNo}
${this.deviceReceiptProviderContext.footerMessage}
        </center>
        <br>
        <br>
        <br>
        <br>`;

        this.htmlPrinterProvider.parse(footerHtml);

        return this;
    }

    cutPaper(): DeviceReceiptProvider {

        this.htmlPrinterProvider.parse('<cut>');

        return this;
    }
    
    openCashDrawer(): DeviceReceiptProvider {

        this.htmlPrinterProvider.parse('<pulse>');

        return this;
    }

    getResult(): string {
        return this.printer.getBuffer();
    }
}