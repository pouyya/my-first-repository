export class PrintTable {
    buffer: string;

    public static CreateTwoColumns(lenghtLeft: number, lenghtRight: number): PrintTable {
        return new PrintTable([new PrintColumn(ColumnAlign.Left, lenghtLeft), new PrintColumn(ColumnAlign.Right, lenghtRight)]);
    }

    constructor(private columnTemplates: PrintColumn[]) {
        this.buffer = "";
    }

    addRow(columns: string[]): PrintTable {
        for (var i = 0; i < columns.length; i++) {
            var columnTemplate = this.columnTemplates[i];
            if (columnTemplate.align == ColumnAlign.Right) {
                this.buffer += PrintTable.padLeft(columns[i], columnTemplate.length);
            }
            else {
                this.buffer += PrintTable.padRight(columns[i], columnTemplate.length);
            }
        }

        return this;
    }

    public toString(): string {
        return this.buffer;
    }

    static padRight(value: string, size: number): string {
        while (value && value.length < size) value = value + " ";
        return value;
    }

    static padLeft(value: string, size: number): string {
        while (value && value.length < size) value = " " + value;
        return value;
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