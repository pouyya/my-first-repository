import { EscPrinterProvider, PrinterWidth } from "../escPrinterProvider";
import { HtmlPrinterProvider } from "../htmlPrinterProvider";
import { ProductionLinePrinterProviderContext } from "./productionLinePrinterProviderContext";
import { TypeHelper } from "@simpleidea/simplepos-core/dist/utility/typeHelper";

export class ProductionLinePrinterProvider {

    htmlPrinterProvider: HtmlPrinterProvider;

    constructor(
        public productionLinePrinterProviderContext: ProductionLinePrinterProviderContext,
        private printer: EscPrinterProvider) {
        this.htmlPrinterProvider = new HtmlPrinterProvider(this.printer);
    }

    setHeader(): ProductionLinePrinterProvider {
        var headerHtml = `
        <center>
            <h2><b>Receipt #${this.productionLinePrinterProviderContext.sale.receiptNo}</b></h2>
        </center>
        <br>
        Date time: ${new Date(this.productionLinePrinterProviderContext.sale.completedAt).toLocaleString()}
        <br>
        ${!TypeHelper.isNullOrWhitespace(this.productionLinePrinterProviderContext.sale.notes) ? "Note: " + this.productionLinePrinterProviderContext.sale.notes + "<br>" : ""}
        `;
        this.htmlPrinterProvider.parse(headerHtml);

        return this;
    }

    setBody(): ProductionLinePrinterProvider {
        var basketItems = "";
        if (this.productionLinePrinterProviderContext.sale.items) {
            basketItems += `<table cols="left-${this.printer.printerWidth == PrinterWidth.Wide ? "10" : "9"},left-${this.printer.printerWidth == PrinterWidth.Wide ? "38" : "33"}">`;

            for (let basketItem of this.productionLinePrinterProviderContext.sale.items) {
                basketItems += `<tr>
                            <td>${basketItem.quantity}</td>
                            <td>${TypeHelper.encodeHtml(basketItem.name)}</td>
                        </tr>`;
                if (basketItem.modifierItems) {
                    for (let basketItemModifier of basketItem.modifierItems) {
                        basketItems += `<tr>
                        <td>   ${basketItemModifier.quantity}</td>
                        <td>   ${TypeHelper.encodeHtml(basketItemModifier.name)}</td>
                    </tr>`;
                    }
                }
            }

            basketItems += `</table>
            <hr>
            <br>`;
            var bodyHtml = `${basketItems}`;

            this.htmlPrinterProvider.parse(bodyHtml);

            return this;
        }
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