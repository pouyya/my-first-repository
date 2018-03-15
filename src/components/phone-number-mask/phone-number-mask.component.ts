import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CountryService } from "./country.service";

@Component({
  selector: 'phone-number-mask',
  templateUrl: 'phone-number-mask.html',
  styleUrls: [
    '/components/phone-number-mask/css/flags.min.scss',
    '/components/phone-number-mask/phone-number-mask.component.scss'
  ]
})
export class PhoneNumberMaskComponent {

  public countries: any[];

  constructor(private countryService: CountryService) {
    this.countries = this.countryService.getCountries();
  }



}