import * as encoding from "text-encoding";

export class EscPrinterConnectorProvider {
    static socket: any;

    constructor(private ip: string, private port: number) {
        if ((<any>window).Socket && !EscPrinterConnectorProvider.socket) {
            EscPrinterConnectorProvider.socket = new (<any>window).Socket();
        }
    }

    public async write(content) {
        if (EscPrinterConnectorProvider.socket) {

            if (EscPrinterConnectorProvider.socket._state != 2) {
                await this.openSock();
            }

            var uint8array = new encoding.TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode(content);
            EscPrinterConnectorProvider.socket.write(uint8array);
        }
    }

    async openSock(): Promise<any> {
        return new Promise((resolve, reject) =>
            EscPrinterConnectorProvider.socket.open(this.ip, this.port, resolve, reject));
    }
}  