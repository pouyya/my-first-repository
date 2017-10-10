import { Injectable } from '@angular/core';
import * as encoding from "text-encoding";

@Injectable()
export class PrintService {
  static tcp : any;

    constructor() {
      if(PrintService.tcp == null) {
        PrintService.tcp = (<any>window).chrome.sockets.tcp
      }
    }

    public print(content: string) {
    }

    private printOnSocket(socketId, content) {
        if (socketId == null) {
          return;
        }
        var uint8array = new encoding.TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode(content);
        PrintService.tcp.send(socketId,
          uint8array.buffer,
          function (result) {
            console.log(result);
          }
        )
      }
}