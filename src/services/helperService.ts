import { Injectable } from '@angular/core';

@Injectable()
export class HelperService {

  private decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // If the value is negative...
    if (value < 0) {
      return -this.decimalAdjust(type, -value, exp);
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  public round10(value: number, exp: number): number {
    return this.decimalAdjust('round', value, exp);
  }

  public floor10(value: number, exp: number): number {
    return this.decimalAdjust('floor', value, exp);
  }

  public ceil10(value: number, exp: number): number {
    return this.decimalAdjust('ceil', value, exp);
  }

  public round2Dec(value: number): number {
    return Math.round(value * 100) / 100;
  }

}