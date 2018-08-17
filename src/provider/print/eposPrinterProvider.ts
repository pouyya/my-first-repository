import { PrintTable } from "./printTable";

export enum PrinterWidth {
    Narrow,
    Wide
}

export class EPosPrinterProvider {

    constructor(public ip: string, public printerWidth: PrinterWidth) {
    }

    /**
     * Align text to the left, when used with EscPrinterProvider.setJustification
     */
    static JUSTIFY_LEFT = 0;
    /**
     * Center text, when used with EscPrinterProvider.setJustification
     */
    static JUSTIFY_CENTER = 1;
    /**
     * Align text to the right, when used with EscPrinterProvider.setJustification
     */
    static JUSTIFY_RIGHT = 2;
    /**
     * Make a full cut, when used with EscPrinterProvider.cut
     */
    static CUT_FULL = 65;
    /**
     * Make a partial cut, when used with EscPrinterProvider.cut
     */
    static CUT_PARTIAL = 66;
    /**
     * Indicates UPC-A barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_UPCA = 65;
    /**
     * Indicates UPC-E barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_UPCE = 66;
    /**
     * Indicates JAN13 barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_JAN13 = 67;
    /**
     * Indicates JAN8 barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_JAN8 = 68;
    /**
     * Indicates CODE39 barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_CODE39 = 69;
    /**
     * Indicates ITF barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_ITF = 70;
    /**
     * Indicates CODABAR barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_CODABAR = 71;
    /**
     * Indicates CODE93 barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_CODE93 = 72;
    /**
     * Indicates CODE128 barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_CODE128 = 73;
    /**
     * Indicates that HRI (human-readable interpretation) text should not be
     * printed, when used with EscPrinterProvider.setBarcodeTextPosition
     */
    static BARCODE_TEXT_NONE = 0;
    /**
     * Indicates that HRI (human-readable interpretation) text should be printed
     * above a barcode, when used with EscPrinterProvider.setBarcodeTextPosition
     */
    static BARCODE_TEXT_ABOVE = 1;
    /**
     * Indicates that HRI (human-readable interpretation) text should be printed
     * below a barcode, when used with EscPrinterProvider.setBarcodeTextPosition
     */
    static BARCODE_TEXT_BELOW = 2;

    public async setJustification($justification = EPosPrinterProvider.JUSTIFY_LEFT) {
    }

    /**
     * Turn emphasized mode on/off.
     *
     *  @param boolean $on true for emphasis, false for no emphasis
     */
    public setEmphasis($on = true) {
    }

    /**
     * Set the size of text, as a multiple of the normal size.
     *
     * @param int $widthMultiplier Multiple of the regular height to use (range 1 - 8)
     * @param int $heightMultiplier Multiple of the regular height to use (range 1 - 8)
     */
    public setTextSize($widthMultiplier, $heightMultiplier) {
        // let $c = Math.pow(2, 4) * ($widthMultiplier - 1) + ($heightMultiplier - 1);
        // this.buffer += EscPrinterProvider.GS + "!" + String.fromCharCode($c);
    }

    /**
   * Print and feed line / Print and feed n lines.
   *
   * @param int $lines Number of lines to feed
   */
    public feed(lines = 1) {
        // if (lines <= 1) {
        //     this.buffer += (EscPrinterProvider.LF);
        // } else {
        //     this.buffer += (EscPrinterProvider.ESC + "d" + String.fromCharCode(lines));
        // }
    }

    /**
     * Add text to the buffer.
     *
     * Text should either be followed by a line-break, or feed() should be called
     * after this to clear the print buffer.
     *
     * @param string $str Text to print
     */
    public text($str = "") {
        // this.buffer += $str;
    }


    /**
     * Cut the paper.
     *
     * @param int $mode Cut mode, either EscPrinterProvider.CUT_FULL or EscPrinterProvider.CUT_PARTIAL. If not specified, `EscPrinterProvider.CUT_FULL` will be used.
     * @param int $lines Number of lines to feed
     */
    public cut(mode = EPosPrinterProvider.CUT_FULL, lines = 3) {
        // this.buffer += EscPrinterProvider.GS + "V" + String.fromCharCode(mode) + String.fromCharCode(lines);
    }

    /**
     * Generate a pulse, for opening a cash drawer if one is connected.
     * The default settings should open an Epson drawer.
     *
     * @param int $pin 0 or 1, for pin 2 or pin 5 kick-out connector respectively.
     * @param int $on_ms pulse ON time, in milliseconds.
     * @param int $off_ms pulse OFF time, in milliseconds.
     */
    public pulse($pin = 0, $on_ms = 120, $off_ms = 240) {
        // this.buffer += EscPrinterProvider.ESC + "p" + String.fromCharCode($pin + 48) + String.fromCharCode($on_ms / 2) + String.fromCharCode($off_ms / 2);
    }

    /**
     * Print a barcode.
     *
     * @param string $content The information to encode.
     * @param int $type The barcode standard to output. Supported values are
     * `Printer::BARCODE_UPCA`, `Printer::BARCODE_UPCE`, `Printer::BARCODE_JAN13`,
     * `Printer::BARCODE_JAN8`, `Printer::BARCODE_CODE39`, `Printer::BARCODE_ITF`,
     * `Printer::BARCODE_CODABAR`, `Printer::BARCODE_CODE93`, and `Printer::BARCODE_CODE128`.
     * If not specified, `Printer::BARCODE_CODE39` will be used. Note that some
     * barcode formats only support specific lengths or sets of characters, and that
     * available barcode types vary between printers.
     * @throws InvalidArgumentException Where the length or characters used in $content is invalid for the requested barcode format.
     */
    public barcode($content, $type = EPosPrinterProvider.BARCODE_CODE39) {
        // this.buffer += EscPrinterProvider.GS + "k" + String.fromCharCode($type - 65) + $content + EscPrinterProvider.NUL;
    }

    public printTable(table: PrintTable) {
        if (table) {
            this.text(table.toString())
        }
    }

}