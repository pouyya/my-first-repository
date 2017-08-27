import _ from 'lodash';
import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'groupBy' })
export class GroupByPipe implements PipeTransform {
  transform(value: Array<any>, property: string): any {
    let keys: any = {};
    let grouped: Array<any> = [];
    keys = _.groupBy(value, property);
    _.each(keys, (val: Array<any>, key) => {
      if (key != "undefined") {
        for (let i = 0; i < val.length; i++) {
          if (i == 0 && val.length == 1) {
            val[i].cssClass = "group-item";
          } else if (i == 0 && val.length > 0) {
            val[i].cssClass = "group-item-start";
          } else if (i == val.length - 1) {
            val[i].cssClass = "group-item-end";
          } else {
            val[i].cssClass = "group-item-mid";
          }
        }
      }
      grouped = grouped.concat(val);

    });
    return grouped;
  }
}