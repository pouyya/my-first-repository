import { ProductionLinePrinterProviderContext } from "./productionLinePrinterProviderContext";
import { TypeHelper } from "@simplepos/core/dist/utility/typeHelper";
import { EPosPrinterProvider, PrinterWidth } from "../eposPrinterProvider";
import { ReportPrinterProviderBase } from "../reportPrinterProviderBase";
import {TableStatus} from "../../../model/tableArrangement";
import {SaleType} from "../../../model/sale";

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
        <br>`;
        if(this.productionLinePrinterProviderContext.sale.type){
            const types = {};
            types[SaleType.DineIn] = 'Dine In';
            types[SaleType.TakeAway] = 'Takeaway';
            this.buffer +=`${types[this.productionLinePrinterProviderContext.sale.type]}:`
        }

        if(this.productionLinePrinterProviderContext.sale.tableId){
            this.buffer += `${this.productionLinePrinterProviderContext.sale.tableName}`;
        } else if (this.productionLinePrinterProviderContext.sale.attachedCustomerName){
            this.buffer += `${this.productionLinePrinterProviderContext.sale.attachedCustomerName}`;
        }

        this.buffer +=`<br>
        </h1>Date time: ${new Date(this.productionLinePrinterProviderContext.sale.completedAt).toLocaleString()}
        <br>
        <h1>${!TypeHelper.isNullOrWhitespace(this.productionLinePrinterProviderContext.sale.notes) ? "Note: " + this.productionLinePrinterProviderContext.sale.notes + "<br>" : ""}
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