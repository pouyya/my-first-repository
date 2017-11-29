import { EscPrinterProvider } from "./escPrinterProvider";
import { PrintTable, PrintColumn, ColumnAlign } from "./printTable";
import { Parser } from "htmlparser2";
import { TypeHelper } from "../utility/typeHelper";
import { HtmlPrinterProvider } from "./htmlPrinterProvider";

export class ReceiptProvider {

    htmlPrinterProvider: HtmlPrinterProvider;

    constructor(printer: EscPrinterProvider) {
        this.htmlPrinterProvider = new HtmlPrinterProvider(printer);
    }


    setHeader(): ReceiptProvider {

        var headerHtml = `
        <center>
            <h2><b>Medi Hair</b></h2>Barber shop in balgowlah
Ph: (02) 8034 8891
ABN: 49 864 355 835
        </center>
        <table cols="left-24,right-24">
            <tr>
                <td>TAX INVOICE</td>
                <td>23/11/2017</td>
            </tr>
        </table>
        <br>
        <br>`;

        this.htmlPrinterProvider.parse(headerHtml);

        return this;
    }

    setBody(): ReceiptProvider {

        var bodyHtml = `
        <table cols="left-38,right-10">
            <tr>
                <td>Example item #1</td>
                <td>$20.00</td>
            </tr>
            <tr>
                <td>Example item #2</td>
                <td>$20.00</td>
                </tr>
            <tr>
                <td>Example item #3</td>
                <td>$20.00</td>
            </tr>
            <tr>
                <td>Example item #4</td>
                <td>$20.00</td>
            </tr>
            <tr>
                <td>Example item #5</td>
                <td>$34.34</td>
            </tr>    
            <tr>
                <td>Example item #6</td>
                <td>$41.35</td>
            </tr>    
            <tr>
                <td>Example item 7#</td>
                <td>$51.31</td>
            </tr>                            
            <tr>
                <td>Example item #8</td>
                <td>$100.1</td>
            </tr>
        </table>
        <br>
        <br>
        <h3>
            <table cols="left-5,right-19">
                <tr>
                    <td>TOTAL</td>
                    <td>$1,405.00</td>
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
            <barcode>ABC</barcode>
23/11/2017 5:38 PM  PM82341234123
<b>Tell us what you think</b>
To provide feedback call us or goto medihair.com.au
        </center>
        <br>
        <br>
        <br>
        <br>`;
            
        this.htmlPrinterProvider.parse(footerHtml);
        
        return this;
    }
}