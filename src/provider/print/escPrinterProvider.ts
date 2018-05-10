import { PrintTable } from "./printTable";

export class EscPrinterProvider {
    /**
     * ASCII null control character
     */
    static NUL: string = "\x00";
    /**
     * ASCII linefeed control character
     */
    static LF = "\x0a";
    /**
     * ASCII escape control character
     */
    static ESC = "\x1b";
    /**
     * ASCII form separator control character
     */
    static FS = "\x1c";
    /**
     * ASCII form feed control character
     */
    static FF = "\x0c";
    /**
     * ASCII group separator control character
     */
    static GS = "\x1d";
    /**
     * ASCII data link escape control character
     */
    static DLE = "\x10";
    /**
     * ASCII end of transmission control character
     */
    static EOT = "\x04";
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
    /**
     * Use the first color (usually black), when used with EscPrinterProvider.setColor
     */
    static COLOR_1 = 0;
    /**
     * Use the second color (usually red or blue), when used with EscPrinterProvider.setColor
     */
    static COLOR_2 = 1;
    /**
     * Make a full cut, when used with EscPrinterProvider.cut
     */
    static CUT_FULL = 65;
    /**
     * Make a partial cut, when used with EscPrinterProvider.cut
     */
    static CUT_PARTIAL = 66;
    /**
     * Use Font A, when used with EscPrinterProvider.setFont
     */
    static FONT_A = 0;
    /**
     * Use Font B, when used with EscPrinterProvider.setFont
     */
    static FONT_B = 1;
    /**
     * Use Font C, when used with EscPrinterProvider.setFont
     */
    static FONT_C = 2;
    /**
     * Use default (high density) image size, when used with EscPrinterProvider.graphics,
     * EscPrinterProvider.bitImage or EscPrinterProvider.bitImageColumnFormat
     */
    static IMG_DEFAULT = 0;
    /**
     * Use lower horizontal density for image printing, when used with EscPrinterProvider.graphics,
     * EscPrinterProvider.bitImage or EscPrinterProvider.bitImageColumnFormat
     */
    static IMG_DOUBLE_WIDTH = 1;
    /**
     * Use lower vertical density for image printing, when used with EscPrinterProvider.graphics,
     * EscPrinterProvider.bitImage or EscPrinterProvider.bitImageColumnFormat
     */
    static IMG_DOUBLE_HEIGHT = 2;
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
     * Use Font A, when used with EscPrinterProvider.selectPrintMode
     */
    static MODE_FONT_A = 0;
    /**
     * Use Font B, when used with EscPrinterProvider.selectPrintMode
     */
    static MODE_FONT_B = 1;
    /**
     * Use text emphasis, when used with EscPrinterProvider.selectPrintMode
     */
    static MODE_EMPHASIZED = 8;
    /**
     * Use double height text, when used with EscPrinterProvider.selectPrintMode
     */
    static MODE_DOUBLE_HEIGHT = 16;
    /**
     * Use double width text, when used with EscPrinterProvider.selectPrintMode
     */
    static MODE_DOUBLE_WIDTH = 32;
    /**
     * Underline text, when used with EscPrinterProvider.selectPrintMode
     */
    static MODE_UNDERLINE = 128;
    /**
     * Indicates standard PDF417 code
     */
    static PDF417_STANDARD = 0;
    /**
     * Indicates truncated PDF417 code
     */
    static PDF417_TRUNCATED = 1;
    /**
     * Indicates error correction level L when used with EscPrinterProvider.qrCode
     */
    static QR_ECLEVEL_L = 0;
    /**
     * Indicates error correction level M when used with EscPrinterProvider.qrCode
     */
    static QR_ECLEVEL_M = 1;
    /**
     * Indicates error correction level Q when used with EscPrinterProvider.qrCode
     */
    static QR_ECLEVEL_Q = 2;
    /**
     * Indicates error correction level H when used with EscPrinterProvider.qrCode
     */
    static QR_ECLEVEL_H = 3;
    /**
     * Indicates QR model 1 when used with EscPrinterProvider.qrCode
     */
    static QR_MODEL_1 = 1;
    /**
     * Indicates QR model 2 when used with EscPrinterProvider.qrCode
     */
    static QR_MODEL_2 = 2;
    /**
     * Indicates micro QR code when used with EscPrinterProvider.qrCode
     */
    static QR_MICRO = 3;
    /**
     * Indicates a request for printer status when used with
     * EscPrinterProvider.getPrinterStatus (experimental)
     */
    static STATUS_PRINTER = 1;
    /**
     * Indicates a request for printer offline cause when used with
     * EscPrinterProvider.getPrinterStatus (experimental)
     */
    static STATUS_OFFLINE_CAUSE = 2;
    /**
     * Indicates a request for error cause when used with EscPrinterProvider.getPrinterStatus
     * (experimental)
     */
    static STATUS_ERROR_CAUSE = 3;
    /**
     * Indicates a request for error cause when used with EscPrinterProvider.getPrinterStatus
     * (experimental)
     */
    static STATUS_PAPER_ROLL = 4;
    /**
     * Indicates a request for ink A status when used with EscPrinterProvider.getPrinterStatus
     * (experimental)
     */
    static STATUS_INK_A = 7;
    /**
     * Indicates a request for ink B status when used with EscPrinterProvider.getPrinterStatus
     * (experimental)
     */
    static STATUS_INK_B = 6;
    /**
     * Indicates a request for peeler status when used with EscPrinterProvider.getPrinterStatus
     * (experimental)
     */
    static STATUS_PEELER = 8;
    /**
     * Indicates no underline when used with EscPrinterProvider.setUnderline
     */
    static UNDERLINE_NONE = 0;
    /**
     * Indicates single underline when used with EscPrinterProvider.setUnderline
     */
    static UNDERLINE_SINGLE = 1;
    /**
     * Indicates double underline when used with EscPrinterProvider.setUnderline
     */
    static UNDERLINE_DOUBLE = 2;

    private buffer: string;

    constructor() {
        this.buffer = "";
        this.initialize();
        this.setFont();
    }

    /**
 * Cut the paper.
 *
 * @param int $mode Cut mode, either EscPrinterProvider.CUT_FULL or EscPrinterProvider.CUT_PARTIAL. If not specified, `EscPrinterProvider.CUT_FULL` will be used.
 * @param int $lines Number of lines to feed
 */
    public cut(mode = EscPrinterProvider.CUT_FULL, lines = 3) {
        this.buffer += EscPrinterProvider.GS + "V" + String.fromCharCode(mode) + String.fromCharCode(lines);
    }

    /**
   * Print and feed line / Print and feed n lines.
   *
   * @param int $lines Number of lines to feed
   */
    public feed(lines = 1) {
        if (lines <= 1) {
            this.buffer += (EscPrinterProvider.LF);
        } else {
            this.buffer += (EscPrinterProvider.ESC + "d" + String.fromCharCode(lines));
        }
    }

    /**
   * Initialize printer. This resets formatting back to the defaults.
   */
    public initialize() {
        this.buffer += EscPrinterProvider.ESC + "@";
    }

    //Set font type
    public setFont(font = EscPrinterProvider.FONT_A) {
        this.buffer += EscPrinterProvider.ESC + "M" +  String.fromCharCode(font);
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
        this.buffer += EscPrinterProvider.ESC + "p" + String.fromCharCode($pin + 48) + String.fromCharCode($on_ms / 2) + String.fromCharCode($off_ms / 2);
    }

    /**
     * Turn double-strike mode on/off.
     *
     * @param boolean $on true for double strike, false for no double strike
     */
    public setDoubleStrike($on = true) {
        this.buffer += EscPrinterProvider.ESC + "G" + ($on ? String.fromCharCode(1) : String.fromCharCode(0));
    }

    /**
     * Turn emphasized mode on/off.
     *
     *  @param boolean $on true for emphasis, false for no emphasis
     */
    public setEmphasis($on = true) {
        this.buffer += EscPrinterProvider.ESC + "E" + ($on ? String.fromCharCode(1) : String.fromCharCode(0));
    }

    /**
     * Select justification.
     *
     * @param int $justification One of EscPrinterProvider.JUSTIFY_LEFT, EscPrinterProvider.JUSTIFY_CENTER, or EscPrinterProvider.JUSTIFY_RIGHT.
     */
    public setJustification($justification = EscPrinterProvider.JUSTIFY_LEFT) {
        this.buffer += EscPrinterProvider.ESC + "a" + String.fromCharCode($justification);
    }

    /**
     * Set the height of the line.
     *
     * Some printers will allow you to overlap lines with a smaller line feed.
     *
     * @param int $height The height of each line, in dots. If not set, the printer
     *  will reset to its default line spacing.
     */
    public setLineSpacing($height = null) {
        if ($height === null) {
            // Reset to default
            this.buffer += EscPrinterProvider.ESC + "2"; // Revert to default line spacing
            return;
        }
        this.buffer += EscPrinterProvider.ESC + "3" + String.fromCharCode($height);
    }

    /**
     * Set print area left margin. Reset to default with EscPrinterProvider.initialize()
     *
     * @param int $margin The left margin to set on to the print area, in dots.
     */
    public setPrintLeftMargin($margin = 0) {
        this.buffer += EscPrinterProvider.GS + 'L' + EscPrinterProvider.intLowHigh($margin, 2);
    }
    /**
     * Set print area width. This can be used to add a right margin to the print area.
     * Reset to default with EscPrinterProvider.initialize()
     *
     * @param int $width The width of the page print area, in dots.
     */
    public setPrintWidth($width = 512) {
        this.buffer += EscPrinterProvider.GS + 'W' + EscPrinterProvider.intLowHigh($width, 2);
    }

    /**
     * Set the size of text, as a multiple of the normal size.
     *
     * @param int $widthMultiplier Multiple of the regular height to use (range 1 - 8)
     * @param int $heightMultiplier Multiple of the regular height to use (range 1 - 8)
     */
    public setTextSize($widthMultiplier, $heightMultiplier) {
        let $c = Math.pow(2, 4) * ($widthMultiplier - 1) + ($heightMultiplier - 1);
        this.buffer += EscPrinterProvider.GS + "!" + String.fromCharCode($c);
    }

    /**
     * Set underline for printed text.
     *
     * Argument can be true/false, or one of UNDERLINE_NONE,
     * UNDERLINE_SINGLE or UNDERLINE_DOUBLE.
     *
     * @param int $underline Either true/false, or one of EscPrinterProvider.UNDERLINE_NONE, EscPrinterProvider.UNDERLINE_SINGLE or EscPrinterProvider.UNDERLINE_DOUBLE. Defaults to EscPrinterProvider.UNDERLINE_SINGLE.
     */
    public setUnderline($underline = EscPrinterProvider.UNDERLINE_SINGLE) {
        /* Set the underline */
        this.buffer += EscPrinterProvider.ESC + "-" + String.fromCharCode($underline);
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
        this.buffer += $str;
    }

    public printTable(table: PrintTable) {
        if (table) {
            this.text(table.toString())
        }
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
    public barcode($content, $type = EscPrinterProvider.BARCODE_CODE39) {
        this.buffer += EscPrinterProvider.GS + "k" + String.fromCharCode($type - 65) + $content + EscPrinterProvider.NUL;
    }

    /**
     * get internal buffer
     */
    public getBuffer(): string {
        return this.buffer;
    }

    /**
     * Generate two characters for a number: In lower and higher parts, or more parts as needed.
     *
     * @param int $input Input number
     * @param int $length The number of bytes to output (1 - 4).
     */
    protected static intLowHigh($input, $length) {
        let $outp = "";
        for (var $i = 0; $i < $length; $i++) {
            $outp += String.fromCharCode($input % 256);
            $input = ($input / 256); //as integer
        }
        return $outp;
    }
}