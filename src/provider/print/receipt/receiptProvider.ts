import { HtmlPrinterProvider } from "../htmlPrinterProvider";
import { ReceiptProviderContext } from "./receiptProviderContext";
import { TypeHelper } from "@simplepos/core/dist/utility/typeHelper";
import { TranslateService } from "@ngx-translate/core";
import { EPosPrinterProvider, PrinterWidth } from "../eposPrinterProvider";

export class ReceiptProvider {

    htmlPrinterProvider: HtmlPrinterProvider;

    constructor(
        public receiptProviderContext: ReceiptProviderContext,
        private translateService: TranslateService,
        private printer: EPosPrinterProvider) {
        this.htmlPrinterProvider = new HtmlPrinterProvider(this.printer);
    }

    setHeader(): ReceiptProvider {
        var headerHtml = `
        <center>
            <h2><b>${this.receiptProviderContext.invoiceTitle}</b></h2>${this.receiptProviderContext.shopName}
Ph: ${this.receiptProviderContext.phoneNumber}
${this.translateService.instant('TaxFileNumber')}: ${this.receiptProviderContext.taxFileNumber}
        </center>
        <table cols="left-${this.printer.printerWidth == PrinterWidth.Wide ? "24" : "21"},right-${this.printer.printerWidth == PrinterWidth.Wide ? "24" : "21"}">
            <tr>
                <td>TAX INVOICE</td>
                <td>${new Date(this.receiptProviderContext.sale.completedAt).toLocaleString()}</td>
            </tr>
        </table>
        <br>
        <br>`;

        this.htmlPrinterProvider.parse(headerHtml);

        return this;
    }

    setBody(): ReceiptProvider {
        var basketItems = "";
        if (this.receiptProviderContext.sale.items) {
            basketItems += `<table cols="left-${this.printer.printerWidth == PrinterWidth.Wide ? "7" : "6"},left-${this.printer.printerWidth == PrinterWidth.Wide ? "31" : "27"},right-${this.printer.printerWidth == PrinterWidth.Wide ? "10" : "9"}">`;

            for (let basketItem of this.receiptProviderContext.sale.items) {
                basketItems += `<tr>
                            <td>${basketItem.quantity}</td>
                            <td>${TypeHelper.encodeHtml(basketItem.name)}</td>
                            <td>${TypeHelper.toCurrency(basketItem.finalPrice)}</td>
                        </tr>`;
                if (basketItem.modifierItems) {
                    for (let basketItemModifier of basketItem.modifierItems) {
                        basketItems += `<tr>
                                <td>   ${basketItemModifier.quantity}</td>
                                <td>   ${TypeHelper.encodeHtml(basketItemModifier.name)}</td>
                                <td>${TypeHelper.toCurrency(basketItem.finalPrice)}</td>
                            </tr>`;
                    }
                }
            }

            basketItems += `</table>
            <hr>
            <br>
            <br>`;
        }

        var bodyHtml = `${basketItems}
            <table cols="left-${this.printer.printerWidth == PrinterWidth.Wide ? "10" : "9"},right-${this.printer.printerWidth == PrinterWidth.Wide ? "38" : "33"}">
                <tr>
                    <td>Tax</td>
                    <td>${TypeHelper.toCurrency(this.receiptProviderContext.sale.tax)}</td>
                </tr>
                <tr>
                <td>Sub total</td>
                <td>${TypeHelper.toCurrency(this.receiptProviderContext.sale.subTotal)}</td>
            </tr>                
            </table>                    
            <h3>
            <table cols="left-${this.printer.printerWidth == PrinterWidth.Wide ? "5" : "4"},right-${this.printer.printerWidth == PrinterWidth.Wide ? "19" : "16"}">
                <tr>
                    <td>TOTAL</td>
                    <td>${TypeHelper.toCurrency(this.receiptProviderContext.sale.taxTotal)}</td>
                </tr>
            </table>            
        </h3>            
        <br>
        <br>`;

        this.htmlPrinterProvider.parse(bodyHtml);

        return this;
    }

    setFooter(): ReceiptProvider {

        var footerHtml = `
        <center>
            <barcode>${this.receiptProviderContext.sale.receiptNo}</barcode>
${new Date(this.receiptProviderContext.sale.completedAt).toLocaleString()}  ${this.receiptProviderContext.sale.receiptNo}
${this.receiptProviderContext.footerMessage}
        </center>
        <br>
        <br>
        <br>
        <br>`;

        this.htmlPrinterProvider.parse(footerHtml);

        return this;
    }

    cutPaper(): ReceiptProvider {

        this.htmlPrinterProvider.parse('<cut>');

        return this;
    }

    openCashDrawer(): ReceiptProvider {

        this.htmlPrinterProvider.parse('<pulse>');

        return this;
    }

    print(): Promise<void> {
        
    }
}