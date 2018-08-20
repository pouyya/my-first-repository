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
        this.buffer += `
        <center>
            <h2><b>Receipt #${this.productionLinePrinterProviderContext.sale.receiptNo}</b></h2>
        </center>
        <br>
        Date time: ${new Date(this.productionLinePrinterProviderContext.sale.completedAt).toLocaleString()}
        <br>
        ${!TypeHelper.isNullOrWhitespace(this.productionLinePrinterProviderContext.sale.notes) ? "Note: " + this.productionLinePrinterProviderContext.sale.notes + "<br>" : ""}
        `;

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

            this.buffer += `</table>
            <hr>
            <br>`;

            return this;
        }
    }
}