import { Injectable } from '@angular/core';

@Injectable()
export class HelperService {

  public getUUID() {
    if (typeof (window) !== "undefined" && typeof (window.crypto) !== "undefined" && typeof (window.crypto.getRandomValues) !== "undefined") {
      var buf = new Uint16Array(8);
      window.crypto.getRandomValues(buf);
      return (this.pad4(buf[0]) + this.pad4(buf[1]) + "-" + this.pad4(buf[2]) + "-" + this.pad4(buf[3]) + "-" + this.pad4(buf[4]) + "-" + this.pad4(buf[5]) + this.pad4(buf[6]) + this.pad4(buf[7]));
    }
    else {
      return this.random4() + this.random4() + "-" + this.random4() + "-" + this.random4() + "-" +
        this.random4() + "-" + this.random4() + this.random4() + this.random4();
    }
  }

  private pad4(num) {
    var ret = num.toString(16);
    while (ret.length < 4) {
      ret = "0" + ret;
    }
    return ret;
  }

  private random4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
}