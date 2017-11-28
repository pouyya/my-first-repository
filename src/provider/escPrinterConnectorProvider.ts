import { PlatformService } from "../services/platformService";
import * as encoding from "text-encoding";

export class EscPrinterConnectorProvider {
    static tcp: any;
    static socketId: string;

    constructor(private ip: string, private port: number ) {
        if (EscPrinterConnectorProvider.tcp == null) {
            EscPrinterConnectorProvider.tcp = (<any>window).chrome.sockets.tcp
        }
    }

    public async write(content) {

        if (EscPrinterConnectorProvider.socketId) {
            var info = await this.getInfo(EscPrinterConnectorProvider.socketId);

            if (!info || !info.connected) {
                EscPrinterConnectorProvider.socketId = null;
            }
        }

        if (!EscPrinterConnectorProvider.socketId) {
            await this.connect(this.ip, this.port);
        }

        if (EscPrinterConnectorProvider.socketId == null) {
            return;
        }
        var uint8array = new encoding.TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode(content);
        EscPrinterConnectorProvider.tcp.send(EscPrinterConnectorProvider.socketId,
            uint8array.buffer,
            function (result) {
                console.log(result);
            });
    }

    async getInfo(socketId): Promise<any> {
        return new Promise((resolve, reject) => {
            EscPrinterConnectorProvider.tcp.getInfo(socketId, function (info) {
                resolve(info);
            });
        });
    }

    async connect(ip, port) {
        return new Promise((resolve, reject) => {
            console.log(ip + " " + port);
            EscPrinterConnectorProvider.tcp.create(function (createInfo) {
                EscPrinterConnectorProvider.tcp.connect(createInfo.socketId, ip, port ? port : 9100, function (result) {
                    if (!result) {
                        console.log("connect success!");
                        EscPrinterConnectorProvider.socketId = createInfo.socketId;
                        resolve();
                    } else {
                        EscPrinterConnectorProvider.socketId = null;
                        reject();
                    }
                });
            });
        });
    }
}  