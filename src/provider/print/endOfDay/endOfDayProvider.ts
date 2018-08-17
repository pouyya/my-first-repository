import { HtmlPrinterProvider } from "../htmlPrinterProvider";
import { EndOfDayProviderContext } from "./endOfDayProviderContext";
import { TypeHelper } from "@simplepos/core/dist/utility/typeHelper";
import { EPosPrinterProvider, PrinterWidth } from "../eposPrinterProvider";

export class EndOfDayProvider {

    htmlPrinterProvider: HtmlPrinterProvider;

    constructor(
        public endOfDayProviderContext: EndOfDayProviderContext,
        private printer: EPosPrinterProvider) {
        this.htmlPrinterProvider = new HtmlPrinterProvider(this.printer);
    }

    setHeader(): EndOfDayProvider {
        var headerHtml = `
        <center>
            <h2><b>${this.endOfDayProviderContext.reportTitle}</b>${this.endOfDayProviderContext.storeName}</h2>${this.endOfDayProviderContext.posName}
Shop open time: ${this.endOfDayProviderContext.openTime}
Shop close time: ${this.endOfDayProviderContext.closeTime}
Closure#: ${this.endOfDayProviderContext.closureNumber}
        </center>
        <br>
        <br>`;

        this.htmlPrinterProvider.parse(headerHtml);

        return this;
    }

    setBody(): EndOfDayProvider {
        var bodyHtml = "";

        bodyHtml = this.printDayItems(bodyHtml);
        bodyHtml = this.printCashMovements(bodyHtml);
        bodyHtml = this.printCounts(bodyHtml);

        bodyHtml += `<hr>
        <br>
        <br>`;

        this.htmlPrinterProvider.parse(bodyHtml);

        return this;
    }

    private printCounts(bodyHtml: string) {
        bodyHtml += `<center><h2><b>Total Counts</b></h2></center>
                <br>
                <hr>
                <br>  
                <table cols="left-${this.printer.printerWidth == PrinterWidth.Wide ? "15" : "12"},right-${this.printer.printerWidth == PrinterWidth.Wide ? "11" : "10"},right-${this.printer.printerWidth == PrinterWidth.Wide ? "11" : "10"},right-${this.printer.printerWidth == PrinterWidth.Wide ? "11" : "10"}">
                    <tr>
                        <td>Payment type</td>
                        <td>Expected</td>
                        <td>Difference</td>
                        <td>Counted</td>
                    </tr>                
                    <tr>
                        <td>Cash</td>
                        <td>${TypeHelper.toCurrency(this.endOfDayProviderContext.cashCounted + this.endOfDayProviderContext.cashDifference)}</td>
                        <td>${TypeHelper.toCurrency(-1 * this.endOfDayProviderContext.cashDifference)}</td>
                        <td>${TypeHelper.toCurrency(this.endOfDayProviderContext.cashCounted)}</td>
                    </tr>
                    <tr>
                        <td>Credit Card</td>
                        <td>${TypeHelper.toCurrency(this.endOfDayProviderContext.ccCounted + this.endOfDayProviderContext.ccDifference)}</td>
                        <td>${TypeHelper.toCurrency(-1 * this.endOfDayProviderContext.ccDifference)}</td>
                        <td>${TypeHelper.toCurrency(this.endOfDayProviderContext.ccCounted)}</td>
                    </tr>                    
                </table>                
                <hr>
                <br>
                <table cols="left-${this.printer.printerWidth == PrinterWidth.Wide ? "15" : "12"},right-${this.printer.printerWidth == PrinterWidth.Wide ? "11" : "10"},right-${this.printer.printerWidth == PrinterWidth.Wide ? "11" : "10"},right-${this.printer.printerWidth == PrinterWidth.Wide ? "11" : "10"}">
                    <tr>
                        <td>Total Counts</h2></td>
                        <td>${TypeHelper.toCurrency(this.endOfDayProviderContext.totalCounted + this.endOfDayProviderContext.totalDifference)}</td>
                        <td>${TypeHelper.toCurrency(-1 * this.endOfDayProviderContext.totalDifference)}</td>
                        <td>${TypeHelper.toCurrency(this.endOfDayProviderContext.totalCounted)}</td>
                    </tr>                                        
                </table>    
                <hr>                            
                <br>
                <br>
                <br>`;

        return bodyHtml;
    }

    private printCashMovements(bodyHtml: string) {
        bodyHtml += `
                <center><h2><b>Cash Movement Amounts</b></h2></center>
                <br>
                <hr>
                <br>          
                <table cols="left-${this.printer.printerWidth == PrinterWidth.Wide ? "38" : "33"},right-${this.printer.printerWidth == PrinterWidth.Wide ? "10" : "9"}">
                    <tr>
                        <td>Open float</td>
                        <td>${TypeHelper.toCurrency(this.endOfDayProviderContext.openFloat)}</td>
                    </tr>
                    <tr>
                        <td>Cash in</td>
                        <td>${TypeHelper.toCurrency(this.endOfDayProviderContext.cashIn)}</td>
                    </tr>
                    <tr>
                        <td>Cash out</td>
                        <td>${TypeHelper.toCurrency(this.endOfDayProviderContext.cashOut)}</td>
                    </tr>
                </table>
                
                <hr>
                <br>                
                
                <table cols="left-${this.printer.printerWidth == PrinterWidth.Wide ? "38" : "33"},right-${this.printer.printerWidth == PrinterWidth.Wide ? "10" : "9"}">
                    <tr>
                        <td>Total Cash Movements</td>
                        <td>${TypeHelper.toCurrency(this.endOfDayProviderContext.openFloat + this.endOfDayProviderContext.cashIn + this.endOfDayProviderContext.cashOut)}</td>
                    </tr>
                </table>                                    

                <br>
                <hr>
                <br>
                <br>
                <br>`;

        return bodyHtml;
    }

    private printDayItems(bodyHtml: string) {
        if (this.endOfDayProviderContext.dayItems) {
            let sumOfDay = 0;
            bodyHtml += `<center><h2><b>Sales per Item</b></h2></center>
                        <br>
                        <hr>
                        <br>            
                        <table cols="left-4,left-${this.printer.printerWidth == PrinterWidth.Wide ? "34" : "30"},right-${this.printer.printerWidth == PrinterWidth.Wide ? "10" : "8"}">`;
            for (var itemkey in this.endOfDayProviderContext.dayItems) {
                var dayItem = this.endOfDayProviderContext.dayItems[itemkey];
                if (dayItem) {
                    bodyHtml += `<tr>
                                <td>${dayItem.totalQuantity}</td>
                                <td>${dayItem.name}</td>
                                <td>${TypeHelper.toCurrency(dayItem.totalPrice)}</td>
                            </tr>`;
                    sumOfDay += dayItem.totalPrice;
                }
            }
            bodyHtml += '</table>';
            bodyHtml += `<br>
            <hr>
            <br>
            <table cols="left-${this.printer.printerWidth == PrinterWidth.Wide ? "38" : "33"},right-${this.printer.printerWidth == PrinterWidth.Wide ? "10" : "9"}">
                <tr>
                    <td>Total Sales per Item</td>
                    <td>${TypeHelper.toCurrency(sumOfDay)}</td>
                </tr>
            </table>

            <br>
            <hr>
            <br>
            <br>
            <br>`;

        }

        return bodyHtml;
    }

    setFooter(): EndOfDayProvider {

        var footerHtml = `<center>Current date/time: ${this.endOfDayProviderContext.currentDateTime}
By: ${this.endOfDayProviderContext.employeeFullName}
<barcode>${this.endOfDayProviderContext.closureNumber}</barcode>
</center>
            <br>
            <br>
            <br>
            <br>
            <hr>
            <br>`;

        this.htmlPrinterProvider.parse(footerHtml);

        return this;
    }

    cutPaper(): EndOfDayProvider {

        this.htmlPrinterProvider.parse('<cut>');

        return this;
    }


    print(): Promise<void> {

    }
}