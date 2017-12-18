import { EscPrinterProvider } from "../escPrinterProvider";
import { HtmlPrinterProvider } from "../htmlPrinterProvider";
import { EndOfDayProviderContext } from "./endOfDayProviderContext";

export class EndOfDayProvider {

    printer: EscPrinterProvider;
    htmlPrinterProvider: HtmlPrinterProvider;

    constructor(public endOfDayProviderContext: EndOfDayProviderContext) {
        this.printer = new EscPrinterProvider();
        this.htmlPrinterProvider = new HtmlPrinterProvider(this.printer);
    }

    setHeader(): EndOfDayProvider {
        var headerHtml = `
        <center>
            <h2><b>End Of Day Report (Z-Report)</b>${this.endOfDayProviderContext.storeName}</h2>${this.endOfDayProviderContext.posName}
Current date/time: ${this.endOfDayProviderContext.currentDateTime}
By: ${this.endOfDayProviderContext.staffFullName}
Period: ${this.endOfDayProviderContext.openTime} - ${this.endOfDayProviderContext.closeTime}
Closure#: ${this.endOfDayProviderContext.closureNumber}
        </center>
        <br>
        <br>`;

        this.htmlPrinterProvider.parse(headerHtml);

        return this;
    }

    setBody(): EndOfDayProvider {
        var bodyHtml = `<table cols="left-34,right-10">
                <tr>
                  <td>Open float</td>
                  <td>${this.endOfDayProviderContext.openFloat}</td>
                </tr>
                </table>`

        this.htmlPrinterProvider.parse(bodyHtml);

        return this;
    }

    //     setFooter(): ReceiptProvider {

    //         var footerHtml = `
    //         <center>
    //             <barcode>${this.endOfDayProviderContext.sale.receiptNo}</barcode>
    // ${new Date(this.endOfDayProviderContext.sale.completedAt).toLocaleString()}  ${this.endOfDayProviderContext.sale.receiptNo}
    // ${this.endOfDayProviderContext.footerMessage}
    //         </center>
    //         <br>
    //         <br>
    //         <br>
    //         <br>`;

    //         this.htmlPrinterProvider.parse(footerHtml);

    //         return this;
    //     }

    //     cutPaper(): ReceiptProvider {

    //         this.htmlPrinterProvider.parse('<cut>');

    //         return this;
    //     }


    getResult(): string {
        return this.printer.getBuffer();
    }
}