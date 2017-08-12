import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'roundTo' })
export class RoundToPipe implements PipeTransform {
  transform(value: number, digits: number = 0): number {
    let m = Math.pow(10, digits);
    value = parseFloat((value * m).toFixed(11));
    return Number((Math.round(value) / m).toFixed(2))
  }
}