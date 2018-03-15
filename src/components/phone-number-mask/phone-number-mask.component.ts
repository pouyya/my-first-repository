import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CountryService } from "./country.service";

@Component({
  selector: 'phone-number-mask',
  templateUrl: 'phone-number-mask.html',
  styleUrls: [
    '/components/phone-number-mask/css/flags.scss',
    '/components/phone-number-mask/phone-number-mask.component.scss'
  ]
})
export class PhoneNumberMaskComponent {

  public countries: any[];
  public countryMasks: Object;
  public phoneNumber: string;
  public selectedCountryCode: any;
  public selectedMask = "";

  constructor(private countryService: CountryService) {
    this.countries = this.countryService.getCountries();
    this.countryMasks = this.countryService.getCountriesMask();
    this.selectedCountryCode = 'pk';
    this.onCountrySelect(this.selectedCountryCode);
  }

  public onCountrySelect(code){
    this.selectedMask = this.countryMasks[code];
    const country = this.countries.find(country => country.countryCode === code);
    this.phoneNumber = `+${country.dialCode}`;
  }


}