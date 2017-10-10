import { ConfigService } from './configService';
import { Injectable } from '@angular/core';
import * as encoding from "text-encoding";

@Injectable()
export class PrintService {
  static tcp: any;
  static socketId: string;
  Esc: _EscCommand;

  constructor() {
    if (PrintService.tcp == null) {
      PrintService.tcp = (<any>window).chrome.sockets.tcp
    }
    this.Esc = new _EscCommand();
  }

  public async print() {
    if (!PrintService.socketId) {
      await this.connect(ConfigService.printerIP, ConfigService.printerPort);
    }
    var escCommand = this.Esc.InitializePrinter +
      this.Esc.TextAlignRight + "HelloWorld!\n" +
      this.Esc.TextAlignCenter + "HelloWorld!\n" +
      this.Esc.TextAlignLeft + "HelloWorld!\n" +
      this.Esc.BoldOn + "HelloWorld!\n" + this.Esc.BoldOff +
      this.Esc.DoubleHeight + "HelloWorld!\n" + this.Esc.DoubleOff +
      this.Esc.DoubleWidth + "HelloWorld!\n" + this.Esc.DoubleOff +
      this.Esc.DoubleOn + "HelloWorld!\n" + this.Esc.DoubleOff +
      this.Esc.CutAndFeedLine(0);
    this.printOnSocket(escCommand);
  }

  async connect(ip, port) {
    return new Promise((resolve, reject) => {
      console.log(ip + " " + port);
      PrintService.tcp.create(function (createInfo) {
        PrintService.tcp.connect(createInfo.socketId, ip, port ? port : 9100, function (result) {
          if (!result) {
            console.log("connect success!");
            PrintService.socketId = createInfo.socketId;
            resolve();
          } else {
            PrintService.socketId = null;
            reject();
          }
        });
      });
    });
  }

  private printOnSocket(content) {
    if (PrintService.socketId == null) {
      return;
    }
    var uint8array = new encoding.TextEncoder('gb18030', { NONSTANDARD_allowLegacyEncoding: true }).encode(content);
    PrintService.tcp.send(PrintService.socketId,
      uint8array.buffer,
      function (result) {
        console.log(result);
      });
  }
}

export class _EscCommand {
  ESC: string;
  GS: string;
  InitializePrinter: string;
  BoldOn: string;
  BoldOff: string;
  DoubleHeight: string;
  DoubleWidth: string;
  DoubleOn: string;
  DoubleOff: string;
  PrintAndFeedMaxLine: string;
  TextAlignLeft: string;
  TextAlignCenter: string;
  TextAlignRight: string;

  constructor() {
    this.ESC = "\u001B";
    this.GS = "\u001D";
    this.InitializePrinter = this.ESC + "@";
    this.BoldOn = this.ESC + "E" + "\u0001";
    this.BoldOff = this.ESC + "E" + "\0";
    this.DoubleHeight = this.GS + "!" + "\u0001";
    this.DoubleWidth = this.GS + "!" + "\u0010";
    this.DoubleOn = this.GS + "!" + "\u0011"; // 2x sized text (double-high + double-wide)
    this.DoubleOff = this.GS + "!" + "\0";
    this.PrintAndFeedMaxLine = this.ESC + "J" + "\u00FF"; // 打印并走纸 最大255
    this.TextAlignLeft = this.ESC + "a" + "0";
    this.TextAlignCenter = this.ESC + "a" + "1";
    this.TextAlignRight = this.ESC + "a" + "2";
  }

  public CutAndFeedLine(verticalUnit) {
    if (verticalUnit === void 0) {
      return this.GS + "v" + 1;
    }
    if (verticalUnit > 255)
      verticalUnit = 255;
    if (verticalUnit < 0)
      verticalUnit = 0;
    return this.GS + "V" + String.fromCharCode(verticalUnit);
  }
}