import { PrintTable } from "./printTable";
import { Pro } from "@ionic/pro";
import { ErrorLoggingService } from "../../services/ErrorLoggingService";

export enum PrinterWidth {
    Narrow,
    Wide
}

export class EPosPrinterProvider {

    posprinter: any;
    connected: boolean;

    constructor(public ip: string, public printerWidth: PrinterWidth, private errorLoggingService: ErrorLoggingService) {
        this.posprinter = (<any>window).posprinter;
    }

    static EPOS_OC_FALSE = 0;
    static EPOS_OC_TRUE = 1;
    static EPOS_OC_PARAM_UNSPECIFIED = -1;

    static EPOS_OC_HRI_NONE = 0;
    static EPOS_OC_HRI_ABOVE = 1;
    static EPOS_OC_HRI_BELOW = 2;
    static EPOS_OC_HRI_BOTH = 3;

    static EPOS_OC_FONT_A = 0;
    static EPOS_OC_FONT_B = 1;
    static EPOS_OC_FONT_C = 2;
    static EPOS_OC_FONT_D = 3;
    static EPOS_OC_FONT_E = 4;

    static DRAWER_2PIN = 0;
    static DRAWER_5PIN = 1;

    static PULSE_100 = 0;
    static PULSE_200 = 1;
    static PULSE_300 = 2;
    static PULSE_400 = 3;
    static PULSE_500 = 4;

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
     * Make a no feed cut, when used with EscPrinterProvider.cut
     */
    static CUT_NO_FEED = 0;
    /**
     * Make a cut feed, when used with EscPrinterProvider.cut
     */
    static CUT_FEED = 1;
    /**
     * Make a partial cut, when used with EscPrinterProvider.cut
     */
    static CUT_RESERVE = 2;
    /**
     * Indicates UPC-A barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_UPCA = 0;
    /**
     * Indicates UPC-E barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_UPCE = 1;
    /**
     * Indicates EAN-13 barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_EAN13 = 2;
    /**
     * Indicates JAN13 barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_JAN13 = 3;
    /**
     * Indicates JAN8 barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_JAN8 = 5;
    /**
     * Indicates CODE39 barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_CODE39 = 6;
    /**
     * Indicates ITF barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_ITF = 7;
    /**
     * Indicates CODABAR barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_CODABAR = 8;
    /**
     * Indicates CODE93 barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_CODE93 = 9;
    /**
     * Indicates CODE128 barcode when used with EscPrinterProvider.barcode
     */
    static BARCODE_CODE128 = 10;

    public async connect(): Promise<void> {
        await this.posprinter.connectPrinter(10, this.ip);
        this.connected = true;
    }

    public async setJustification(justification = EPosPrinterProvider.JUSTIFY_LEFT) {
        try {
            if (!this.connected) {
                await this.connect();
            }

            return this.posprinter.addTextAlign(justification)

        } catch (error) {
            var printerError = new Error(`Error in printer setJustification. Arguments: justification='${justification}'`);
            this.errorLoggingService.exception(error, [printerError.message]);
            try {
                this.posprinter.disconnectPrinter();
            }
            catch { }

            throw [printerError, error];
        }
    }

    /**
     * Turn emphasized mode on/off.
     *
     *  @param boolean $on true for emphasis, false for no emphasis
     */
    public async setEmphasis(on = true) {
        try {
            if (!this.connected) {
                await this.connect();
            }

            return this.posprinter.addTextStyle(
                EPosPrinterProvider.EPOS_OC_FALSE,
                EPosPrinterProvider.EPOS_OC_FALSE,
                on ? EPosPrinterProvider.EPOS_OC_TRUE : EPosPrinterProvider.EPOS_OC_FALSE,
                EPosPrinterProvider.EPOS_OC_PARAM_UNSPECIFIED);

        } catch (error) {
            var printerError = new Error(`Error in printing setEmphasis. Arguments: on='${on}'`);
            Pro.monitoring.exception(error, [printerError.message]);
            try {
                this.posprinter.disconnectPrinter();
            }
            catch { }
            throw [printerError, error];
        }
    }

    /**
     * Set the size of text, as a multiple of the normal size.
     *
     * @param int $widthMultiplier Multiple of the regular height to use (range 1 - 8)
     * @param int $heightMultiplier Multiple of the regular height to use (range 1 - 8)
     */
    public async setTextSize(widthMultiplier, heightMultiplier) {
        try {
            if (!this.connected) {
                await this.connect();
            }

            return this.posprinter.addTextSize(widthMultiplier, heightMultiplier);

        } catch (error) {
            var printerError = new Error(`Error in printing setTextSize. Arguments: widthMultiplier='${widthMultiplier}', heightMultiplier='${heightMultiplier}'`);
            this.errorLoggingService.exception(error, [printerError.message]);
            try {
                this.posprinter.disconnectPrinter();
            }
            catch { }
            throw [printerError, error];
        }
    }

    /**
   * Print and feed line / Print and feed n lines.
   *
   * @param int $lines Number of lines to feed
   */
    public async feed(lines = 1) {
        try {
            if (!this.connected) {
                await this.connect();
            }

            return this.posprinter.addFeedLine(lines);

        } catch (error) {
            var printerError = new Error(`Error in printing feed. Arguments: lines='${lines}'`);
            this.errorLoggingService.exception(error, [printerError.message]);
            try {
                this.posprinter.disconnectPrinter();
            }
            catch { }
            throw [printerError, error];
        }
    }

    /**
     * Add text to the buffer.
     *
     * Text should either be followed by a line-break, or feed() should be called
     * after this to clear the print buffer.
     *
     * @param string $str Text to print
     */
    public async text(str = "") {
        try {
            if (!this.connected) {
                await this.connect();
            }

            return this.posprinter.addText(str);

        } catch (error) {
            var printerError = new Error(`Error in printing text. Arguments: str='${str}'`);
            this.errorLoggingService.exception(error, [printerError.message]);
            try {
                this.posprinter.disconnectPrinter();
            }
            catch { }
            throw [printerError, error];
        }
    }


    /**
     * Cut the paper.
     *
     * @param int $mode Cut mode, either EscPrinterProvider.CUT_FULL or EscPrinterProvider.CUT_PARTIAL. If not specified, `EscPrinterProvider.CUT_FULL` will be used.
     * @param int $lines Number of lines to feed
     */
    public async cut(mode = EPosPrinterProvider.CUT_FEED) {
        try {
            if (!this.connected) {
                await this.connect();
            }

            return this.posprinter.addCut(mode);

        } catch (error) {
            var printerError = new Error(`Error in printing cut. Arguments: mode='${mode}'`);
            this.errorLoggingService.exception(error, [printerError.message]);
            try {
                this.posprinter.disconnectPrinter();
            }
            catch { }
            throw [printerError, error];
        }
    }

    /**
     * Generate a pulse, for opening a cash drawer if one is connected.
     * The default settings should open an Epson drawer.
     *
     * @param int $pin 0 or 1, for pin 2 or pin 5 kick-out connector respectively.
     * @param int $on_ms pulse ON time, in milliseconds.
     * @param int $off_ms pulse OFF time, in milliseconds.
     */
    public async pulse() {
        try {
            if (!this.connected) {
                await this.connect();
            }

            return this.posprinter.addPulse(EPosPrinterProvider.DRAWER_2PIN, EPosPrinterProvider.PULSE_100);

        } catch (error) {
            var printerError = new Error(`Error in printing pulse`);
            this.errorLoggingService.exception(error, [printerError.message]);
            try {
                this.posprinter.disconnectPrinter();
            }
            catch { }
            throw [printerError, error];
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
    public async barcode(content, type = EPosPrinterProvider.BARCODE_CODE39) {
        try {
            if (!this.connected) {
                await this.connect();
            }

            return this.posprinter.addBarcode(
                content,
                type,
                EPosPrinterProvider.EPOS_OC_HRI_NONE,
                EPosPrinterProvider.EPOS_OC_FONT_A,
                EPosPrinterProvider.EPOS_OC_PARAM_UNSPECIFIED,
                EPosPrinterProvider.EPOS_OC_PARAM_UNSPECIFIED);

        } catch (error) {
            var printerError = new Error(`Error in printing barcode. Arguments: content='${content}', type='${type}`);
            this.errorLoggingService.exception(error, [printerError.message]);
            try {
                this.posprinter.disconnectPrinter();
            }
            catch { }
            throw [printerError, error];
        }
    }

    public async print() {
        try {
            if (!this.connected) {
                await this.connect();
            }

            return this.posprinter.print();

        } catch (error) {
            var printerError = new Error(`Error in printing.`);
            this.errorLoggingService.exception(error, [printerError.message]);
            try {
                this.posprinter.disconnectPrinter();
            }
            catch { }
            throw [printerError, error];
        }
    }

    public printTable(table: PrintTable) {
        if (table) {
            this.text(table.toString())
        }
    }
}