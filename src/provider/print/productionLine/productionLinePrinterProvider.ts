import { ProductionLinePrinterProviderContext } from "./productionLinePrinterProviderContext";
import { TypeHelper } from "@simplepos/core/dist/utility/typeHelper";
import { EPosPrinterProvider, PrinterWidth } from "../eposPrinterProvider";
import { ReportPrinterProviderBase } from "../reportPrinterProviderBase";

export class ProductionLinePrinterProvider extends ReportPrinterProviderBase {

    constructor(
        public productionLinePrinterProviderContext: ProductionLinePrinterProviderContext,
        printer: EPosPrinterProvider) {
        super(printer);
    }

    setHeader() {
        this.buffer += `<br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <h1>${this.productionLinePrinterProviderContext.headerMessage}
        <center>
            <b>Receipt #${this.productionLinePrinterProviderContext.sale.receiptNo}</b>
        </center>
        <br>
        </h1>Date time: ${new Date(this.productionLinePrinterProviderContext.sale.completedAt).toLocaleString()}
        <br>
        <h1>${!TypeHelper.isNullOrWhitespace(this.productionLinePrinterProviderContext.sale.notes) ? 
            `<br> 
            <hr>
Note: ${this.productionLinePrinterProviderContext.sale.notes}
            <hr>` : ""}
        </h1>`;

        return this;
    }

    setBody(): ProductionLinePrinterProvider {
        var basketItems = "<h1>";
        if (this.productionLinePrinterProviderContext.sale.items) {
            basketItems += `<table cols="left-${this.printer.printerWidth == PrinterWidth.Wide ? "4" : "3"},left-${this.printer.printerWidth == PrinterWidth.Wide ? "20" : "18"}">`;

            for (let basketItem of this.productionLinePrinterProviderContext.sale.items) {
                basketItems += `<tr>
                            <td>${basketItem.quantity}</td>
                            <td>${TypeHelper.encodeHtml(basketItem.name)}</td>
                        </tr>`;
                if (!TypeHelper.isNullOrWhitespace(basketItem.notes)) {
                    basketItems += `<tr>
                    <td> Note</td>
                    <td> ${TypeHelper.encodeHtml(basketItem.notes)}</td>
                </tr>`;
                }
                if (basketItem.modifierItems) {
                    for (let basketItemModifier of basketItem.modifierItems) {
                        basketItems += `<tr>
                        <td>   ${basketItemModifier.quantity}</td>
                        <td>   ${TypeHelper.encodeHtml(basketItemModifier.name)}</td>
                    </tr>`;
                        if (!TypeHelper.isNullOrWhitespace(basketItemModifier.notes)) {
                            basketItems += `<tr>
                            <td>   Note:</td>
                            <td>   ${TypeHelper.encodeHtml(basketItemModifier.notes)}</td>
                        </tr>`;
                        }
                    }
                }
            }

            this.buffer += basketItems + `</table>
            </h1>
            <hr>
            <br>`;

            return this;
        }
    }
}