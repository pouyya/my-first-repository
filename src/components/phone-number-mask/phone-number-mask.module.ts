import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { PhoneNumberMaskComponent } from "./phone-number-mask.component";
import { CountryService } from "./country.service";

@NgModule({
  declarations: [ PhoneNumberMaskComponent ],
  imports: [
    CommonModule, 
    IonicPageModule.forChild(PhoneNumberMaskComponent)
  ],
  providers: [CountryService],
  exports: [ PhoneNumberMaskComponent ]
})
export class PhoneNumberMaskModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PhoneNumberMaskModule,
      providers: [CountryService]
    };
  }
}