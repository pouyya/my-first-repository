import { TranslateService } from "@ngx-translate/core";
import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'translator', pure: false })
export class TranslatorPipe implements PipeTransform {

  constructor(
    private translateService: TranslateService) {
  }

  transform(value: any): string | null {
    if (value) {
      return this.translateService.instant(value);
    } else {
      return null;
    }
  }
}