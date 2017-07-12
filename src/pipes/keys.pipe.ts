import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'keys' })
export class KeysPipe implements PipeTransform {

  transform(value, args: Array<string>): any {
    let keys: Array<any> = [];
    for (let key in value) {
      keys.push({ key: key, value: value[key] });
    }
    return keys;
  }

}