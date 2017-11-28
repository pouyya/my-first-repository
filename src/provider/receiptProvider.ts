import { EscPrinterProvider } from "./escPrinterProvider";
import { PrintTable } from "./printTable";

export class ReceiptProvider {

    constructor(private printer: EscPrinterProvider) {
    }

    setHeader(): ReceiptProvider {
        this.printer.setJustification(EscPrinterProvider.JUSTIFY_CENTER);
        this.printer.setEmphasis(true);
        this.printer.setTextSize(1, 2);
        this.printer.text("Medi Hair\n");
        this.printer.setEmphasis(false);
        this.printer.setTextSize(1, 1);
        this.printer.feed();
        this.printer.text("Barber shop in Balgowlah\n");
        this.printer.text("Ph: (02) 8034 8891\n");
        this.printer.text("ABN: 49 864 355 835\n");
        this.printer.setJustification(EscPrinterProvider.JUSTIFY_LEFT);

        this.printer.printTable(PrintTable.CreateTwoColumns(24, 24)
            .addRow(["TAX INVOICE", "23/11/2017"]));

        this.printer.feed(2);

        return this;
    }

    setBody(): ReceiptProvider {

        this.printer.setJustification(EscPrinterProvider.JUSTIFY_LEFT);

        this.printer.printTable(PrintTable.CreateTwoColumns(38, 10)
            .addRow(["Example item #1", "$20.00"])
            .addRow(["Example item #2", "$21.31"])
            .addRow(["Example item #1", "$22.34"])
            .addRow(["Example item #1", "$3.00"])
            .addRow(["Example item #1", "$41.3"])
            .addRow(["Example item #1", "$124.53"])
            .addRow(["Example item #1", "$400.11"])
            .addRow(["Example item #1", "$504.23"]));

        this.printer.feed(2);
        this.printer.setTextSize(2, 1);
        this.printer.printTable(PrintTable.CreateTwoColumns(8, 16)
            .addRow(["TOTAL", "$113.05"]));
        this.printer.setTextSize(1, 1);
        this.printer.feed(2);

        return this;
    }

    setFooter(): ReceiptProvider {
        this.printer.setJustification(EscPrinterProvider.JUSTIFY_CENTER);
        this.printer.barcode("ABC", EscPrinterProvider.BARCODE_CODE39);
        this.printer.feed();
        this.printer.text("23/11/2017 5:38 PM  PM82341234123\n");
        this.printer.setEmphasis(true);
        this.printer.text("Tell us what you think\n");
        this.printer.setEmphasis(false);
        this.printer.text("To provide feedback call us or goto medihair.com.au\n");
        this.printer.feed(4);

        return this;
    }
}