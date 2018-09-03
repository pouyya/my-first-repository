import { HtmlPrinterProvider } from "./htmlPrinterProvider";
import { EPosPrinterProvider } from "./eposPrinterProvider";

export abstract class ReportPrinterProviderBase  {

    htmlPrinterProvider: HtmlPrinterProvider;
    buffer: string;

    constructor(
        protected printer: EPosPrinterProvider) {
        this.htmlPrinterProvider = new HtmlPrinterProvider(this.printer);
        this.buffer = "";
    }

    cutPaper(): this {

        this.buffer += '<cut>';

        return this;
    }

    openCashDrawer(): this {

        this.buffer += '<pulse>';

        return this;
    }

    public async print(): Promise<void> {
        await this.htmlPrinterProvider.parse(this.buffer);

        return this.printer.print();
    }
}