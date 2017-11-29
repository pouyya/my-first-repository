import { EscPrinterProvider } from "./escPrinterProvider";
import { TypeHelper } from "../utility/typeHelper";
import { HtmlPrinterProvider } from "./htmlPrinterProvider";
import { Sale } from "../model/sale";
import { ReceiptProviderContext } from "./ReceiptProviderContext";

export class ReceiptProvider {

    printer: EscPrinterProvider;
    htmlPrinterProvider: HtmlPrinterProvider;

    constructor(public receiptProviderContext: ReceiptProviderContext) {
        this.printer = new EscPrinterProvider();
        this.htmlPrinterProvider = new HtmlPrinterProvider(this.printer);
    }

    setHeader(): ReceiptProvider {
        var headerHtml = `
        <center>
            <h2><b>${this.receiptProviderContext.invoiceTitle}</b></h2>${this.receiptProviderContext.shopName}
Ph: ${this.receiptProviderContext.phoneNumber}
ABN: ${this.receiptProviderContext.taxFileNumber}
        </center>
        <table cols="left-24,right-24">
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
            basketItems += '<table cols="left-4,left-34,right-10">';

            for (let basketItem of this.receiptProviderContext.sale.items) {
                basketItems += `<tr>
                            <td>${basketItem.quantity}</td>
                            <td>${TypeHelper.encodeHtml(basketItem.name)}</td>
                            <td>${TypeHelper.toCurrency(basketItem.finalPrice)}</td>
                        </tr>`;
            }

            basketItems += `</table>
            <hr>
            <br>
            <br>`;
        }

        var bodyHtml = `${basketItems}
            <table cols="left-10,right-38">
                <tr>
                    <td>Tax</td>
                    <td>${TypeHelper.toCurrency(this.receiptProviderContext.sale.taxTotal)}</td>
                </tr>
                <tr>
                <td>Sub total</td>
                <td>${TypeHelper.toCurrency(this.receiptProviderContext.sale.subTotal)}</td>
            </tr>                
            </table>                    
            <h3>
            <table cols="left-5,right-19">
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
        <br>
        <cut>`;

        this.htmlPrinterProvider.parse(footerHtml);

        return this;
    }

    getResult(): string {
        return this.printer.getBuffer();
    }
}