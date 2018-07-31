import * as encoding from "text-encoding";
import { Pro } from "@ionic/pro";

export class EscPrinterConnectorProvider {
    static socket: any = {};

    constructor(private ip: string, private port: number) {
        this.port = Number(this.port);
        if ((<any>window).Socket && !EscPrinterConnectorProvider.socket[ip]) {
            EscPrinterConnectorProvider.socket[ip] = new (<any>window).Socket();
            EscPrinterConnectorProvider.socket[ip].onClose = this.onClose;
            EscPrinterConnectorProvider.socket[ip].onData = this.onData;
            EscPrinterConnectorProvider.socket[ip].onError = this.onError;
        }
    }

    public async write(content): Promise<any> {
        var currentSocket = EscPrinterConnectorProvider.socket[this.ip];
        var currentIp = this.ip;
        var currentPort = this.port;

        if (currentSocket) {

            try {
                if (currentSocket._state != 2) {
                    await EscPrinterConnectorProvider.openSock(currentSocket, currentIp, currentPort);
                }

                var uint8array = new encoding.TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode(content);

                return EscPrinterConnectorProvider.write(currentSocket, uint8array);
            }
            catch (error) {
                Pro.monitoring.exception(error);
                throw error;
            }
        }
    }

    static async openSock(currentSocket: any, ip: string, port: number): Promise<any> {
        return new Promise((resolve, reject) =>
            currentSocket.open(ip, port, resolve, reject));
    }

    static async write(currentSocket: any, data: any): Promise<any> {
        return new Promise((resolve, reject) =>
            currentSocket.write(data, resolve, reject));
    }

    onData() {
    }

    onError(errorMessage: any) {
        var message = 'error happend while communicating with device. The error: ' + errorMessage;
        Pro.monitoring.log(message, { level: 'error' })
        console.error(message);
    }

    onClose(message) {
        console.log('connection closed. ' + message);
    }
}