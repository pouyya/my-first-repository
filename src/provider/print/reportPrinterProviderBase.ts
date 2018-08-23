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

    cutPaper(): ReportPrinterProviderBase {

        this.buffer += '<cut>';

        return this;
    }

    openCashDrawer(): ReportPrinterProviderBase {

        this.buffer += '<pulse>';

        return this;
    }

    public async print(): Promise<void> {
        await this.htmlPrinterProvider.parse(this.buffer);

        return this.printer.print();
    }
}