import { EscPrinterProvider } from "../escPrinterProvider";
import { HtmlPrinterProvider } from "../htmlPrinterProvider";
import { ProductionLinePrinterProviderContext } from "./productionLinePrinterProviderContext";
import { TypeHelper } from "@simpleidea/simplepos-core/dist/utility/typeHelper";
import { TranslateService } from "@ngx-translate/core";

export class ProductionLinePrinterProvider {

    printer: EscPrinterProvider;
    htmlPrinterProvider: HtmlPrinterProvider;

    constructor(
        public productionLinePrinterProviderContext: ProductionLinePrinterProviderContext,
        private translateService: TranslateService) {
        this.printer = new EscPrinterProvider();
        this.htmlPrinterProvider = new HtmlPrinterProvider(this.printer);
    }

    setHeader(): ProductionLinePrinterProvider {
        var headerHtml = `
        <center>
            <h2><b>${this.productionLinePrinterProviderContext.invoiceTitle}</b></h2>${this.productionLinePrinterProviderContext.shopName}
Ph: ${this.productionLinePrinterProviderContext.phoneNumber}
${this.translateService.instant('TaxFileNumber')}: ${this.productionLinePrinterProviderContext.taxFileNumber}
        </center>
        <table cols="left-24,right-24">
            <tr>
                <td>TAX INVOICE</td>
                <td>${new Date(this.productionLinePrinterProviderContext.sale.completedAt).toLocaleString()}</td>
            </tr>
        </table>
        <br>
        <br>`;

        this.htmlPrinterProvider.parse(headerHtml);

        return this;
    }

    setBody(): ProductionLinePrinterProvider {
        var basketItems = "";
        if (this.productionLinePrinterProviderContext.sale.items) {
            basketItems += '<table cols="left-4,left-34,right-10">';

            for (let basketItem of this.productionLinePrinterProviderContext.sale.items) {
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

    setFooter(): ProductionLinePrinterProvider {

        var footerHtml = `
        <center>
            <barcode>${this.productionLinePrinterProviderContext.sale.receiptNo}</barcode>
${new Date(this.productionLinePrinterProviderContext.sale.completedAt).toLocaleString()}  ${this.productionLinePrinterProviderContext.sale.receiptNo}
${this.productionLinePrinterProviderContext.footerMessage}
        </center>
        <br>
        <br>
        <br>
        <br>`;

        this.htmlPrinterProvider.parse(footerHtml);

        return this;
    }

    cutPaper(): ProductionLinePrinterProvider {

        this.htmlPrinterProvider.parse('<cut>');

        return this;
    }
    
    openCashDrawer(): ProductionLinePrinterProvider {

        this.htmlPrinterProvider.parse('<pulse>');

        return this;
    }

    getResult(): string {
        return this.printer.getBuffer();
    }
}