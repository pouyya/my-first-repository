import { EscPrinterProvider } from "./escPrinterProvider";
import { Parser } from "htmlparser2";
import { PrintTable, PrintColumn, ColumnAlign } from "./printTable";
import { TypeHelper } from "../utility/typeHelper";

export class HtmlPrinterProvider {

    constructor(private printer: EscPrinterProvider) {
    }

    public parse(html: string) {

        var self = this;
        var currentPrintTable: PrintTable;
        var currentRow: Array<string>;
        var onTd: boolean;
        var isBarcode: boolean;

        var parser = new Parser({
            onopentag: function (tagName, attribs) {
                if (tagName == "center") {
                    self.printer.setJustification(EscPrinterProvider.JUSTIFY_CENTER);
                } else if (tagName == "left") {
                    self.printer.setJustification(EscPrinterProvider.JUSTIFY_LEFT);
                } else if (tagName == "b") {
                    self.printer.setEmphasis(true);
                } else if (tagName == "h2") {
                    self.printer.setTextSize(1, 2);
                } else if (tagName == "h3") {
                    self.printer.setTextSize(2, 1);
                } else if (tagName == "br") {
                    self.printer.feed();
                } else if (tagName == "table") {
                    var columns = attribs.cols ? attribs.cols.split(",") : [];
                    var printColumns = new Array<PrintColumn>();

                    for (let column of columns) {
                        var columnVals = column.split("-");
                        var columnAlign = columnVals[0] == "left" ? ColumnAlign.Left : ColumnAlign.Right;
                        printColumns.push(new PrintColumn(columnAlign, +columnVals[1]))
                    }
                    currentPrintTable = new PrintTable(printColumns);

                } else if (tagName == "tr") {
                    currentRow = new Array<string>();
                } else if (tagName == "td") {
                    onTd = true
                } else if (tagName == "barcode") {
                    isBarcode = true;
                } else if (tagName == "hr") {
                    self.printer.text("=".repeat(48));
                } else if (tagName == "cut") {
                    self.printer.cut();
                }
            },
            ontext: function (text) {
                if (!TypeHelper.isNullOrWhitespace(text)) {
                    if (onTd) {
                        currentRow.push(TypeHelper.decodeHtml(text))
                    }
                    else if (isBarcode) {
                        self.printer.barcode(TypeHelper.decodeHtml(text));
                    }
                    else {
                        self.printer.text(TypeHelper.decodeHtml(text) + "\n");
                    }
                }
            },
            onclosetag: function (tagName) {
                if (tagName == "h2" || tagName == "h3") {
                    self.printer.setTextSize(1, 1);
                } else if (tagName == "b") {
                    self.printer.setEmphasis(false);
                } else if (tagName == "table") {
                    if (currentPrintTable) {
                        self.printer.printTable(currentPrintTable);
                    }
                    currentPrintTable = null;
                } else if (tagName == "tr") {
                    if (currentPrintTable && currentRow) {
                        currentPrintTable.addRow(currentRow);
                    }
                    currentRow = null;
                } else if (tagName == "td") {
                    onTd = false;
                } else if (tagName == "center") {
                    self.printer.setJustification(EscPrinterProvider.JUSTIFY_LEFT);
                } else if (tagName == "barcode") {
                    isBarcode = false;
                }
            }
        }, { decodeEntities: false, lowerCaseTags: true });

        parser.write(html);

        parser.end();
    }
}