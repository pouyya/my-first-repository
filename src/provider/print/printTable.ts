import { PrinterWidth } from "./eposPrinterProvider";

export class PrintTable {
    buffer: string;

    constructor(private columnTemplates: PrintColumn[]) {
        this.buffer = "";
    }

    addRow(values: string[]): PrintTable {

        for (var i = 0; i < values.length; i++) {
            this.pad(values[i], i, this.columnTemplates[i].align == ColumnAlign.Left);
        }

        return this;
    }

    public toString(): string {
        return this.buffer;
    }

    pad(value: string, currentColumnIndex: number, padLeft: boolean) {

        var result = "";
        var size = this.columnTemplates[currentColumnIndex].length;

        var words = value.split(' ');

        for (var i = 0; i < words.length; i++) {

            result += words[i];

            if (i < words.length - 1) {
                result += " ";
            }

            if ((i < words.length - 1) && (result.length + words[i + 1].length > size)) {
                this.buffer += result + this.gotoNextLine(result.length, currentColumnIndex);
                result = "";
            }
        }

        if (padLeft) {
            while (result && result.length < size) result = result + " ";
        } else {
            while (result && result.length < size) result = " " + result;
        }

        this.buffer += result;
    }

    gotoNextLine(currentColumnResultLength: number, currentColumnIndex: number) {

        var currenRemaingColumn = this.columnTemplates[currentColumnIndex].length - currentColumnResultLength;

        for (var i = 0; i < this.columnTemplates.length - 1; i++) {
            var columnIndex = (++currentColumnIndex) % this.columnTemplates.length;
            currenRemaingColumn = currenRemaingColumn + this.columnTemplates[columnIndex].length
        }

        return " ".repeat(currenRemaingColumn)
    }
}

export enum ColumnAlign {
    Left,
    Right
}

export class PrintColumn {
    constructor(public align: ColumnAlign, public length: number) {

    }
}