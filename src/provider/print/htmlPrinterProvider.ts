import { EPosPrinterProvider, PrinterWidth } from "./eposPrinterProvider";
import { Parser } from "htmlparser2";
import { PrintTable, PrintColumn, ColumnAlign } from "./printTable";
import { TypeHelper } from "@simplepos/core/dist/utility/typeHelper";



export class HtmlPrinterProvider {

    constructor(private printer: EPosPrinterProvider) {
    }

    public async parse(html: string) {

        var currentPrintTable: PrintTable;
        var currentRow: Array<string>;
        var onTd: boolean;
        var isBarcode: boolean;
        var printerActions = new Array<PrinterAction>();

        var parser = new Parser({
            onopentag: (tagName, attribs) => {
                if (tagName == "center") {
                    printerActions.push(new PrinterAction("setJustification", [EPosPrinterProvider.JUSTIFY_CENTER]));
                } else if (tagName == "left") {
                    printerActions.push(new PrinterAction("setJustification", [EPosPrinterProvider.JUSTIFY_LEFT]));
                } else if (tagName == "b") {
                    printerActions.push(new PrinterAction("setEmphasis", [true]));
                } else if (tagName == "h1") {
                    printerActions.push(new PrinterAction("setTextSize", [2, 2]));
                } else if (tagName == "h2") {
                    printerActions.push(new PrinterAction("setTextSize", [1, 2]));
                } else if (tagName == "h3") {
                    printerActions.push(new PrinterAction("setTextSize", [2, 1]));
                } else if (tagName == "br") {
                    printerActions.push(new PrinterAction("feed"));
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
                    printerActions.push(new PrinterAction("text", ["-".repeat(this.printer.printerWidth == PrinterWidth.Narrow ? 42 : 48)]));
                } else if (tagName == "cut") {
                    printerActions.push(new PrinterAction("cut"));
                } else if (tagName == "pulse") {
                    printerActions.push(new PrinterAction("pulse"));
                }
            },
            ontext: (text) => {
                if (!TypeHelper.isNullOrWhitespace(text)) {
                    if (onTd) {
                        currentRow.push(TypeHelper.decodeHtml(text))
                    }
                    else if (isBarcode) {
                        printerActions.push(new PrinterAction("barcode", [TypeHelper.decodeHtml(text)]));
                    }
                    else {
                        printerActions.push(new PrinterAction("text", [TypeHelper.decodeHtml(text) + "\n"]));
                    }
                }
            },
            onclosetag: (tagName) => {
                if (tagName == "h1" || tagName == "h2" || tagName == "h3") {
                    printerActions.push(new PrinterAction("setTextSize", [1, 1]));
                } else if (tagName == "b") {
                    printerActions.push(new PrinterAction("setEmphasis", [false]));
                } else if (tagName == "table") {
                    if (currentPrintTable) {
                        printerActions.push(new PrinterAction("printTable", [currentPrintTable]));
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
                    printerActions.push(new PrinterAction("setJustification", [EPosPrinterProvider.JUSTIFY_LEFT]));
                } else if (tagName == "barcode") {
                    isBarcode = false;
                }
            }
        }, { decodeEntities: false, lowerCaseTags: true });

        parser.write(html);

        parser.end();

        for (let printerAction of printerActions) {
            switch (printerAction.action) {
                case "setJustification":
                    await this.printer.setJustification(printerAction.argument[0]);
                    break;
                case "setEmphasis":
                    await this.printer.setEmphasis(printerAction.argument[0]);
                    break;
                case "setTextSize":
                    await this.printer.setTextSize(printerAction.argument[0], printerAction.argument[1]);
                    break;
                case "feed":
                    await this.printer.feed();
                    break;
                case "text":
                    await this.printer.text(printerAction.argument[0]);
                    break;
                case "cut":
                    await this.printer.cut();
                    break;
                case "pulse":
                    await this.printer.pulse();
                    break;
                case "barcode":
                    await this.printer.barcode(printerAction.argument[0]);
                    break;
                case "printTable":
                    await this.printer.printTable(printerAction.argument[0]);
                    break;
                default:
                    throw new Error(`The ${printerAction.action} is not implemented`);
            }
        }
    }
}

class PrinterAction {

    constructor(action: string, argument: Array<any> = null) {
        this.action = action;
        this.argument = argument;
    }

    action: string;
    argument: Array<any>;
}