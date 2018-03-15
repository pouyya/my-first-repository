import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicPageModule } from 'ionic-angular';
import { BrMaskerModule } from 'brmasker-ionic-3';
import { PhoneNumberMaskComponent } from "./phone-number-mask.component";
import { CountryService } from "./country.service";

@NgModule({
  declarations: [ PhoneNumberMaskComponent ],
  imports: [
    CommonModule,
    BrMaskerModule,
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