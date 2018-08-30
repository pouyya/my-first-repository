import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {IonSimpleWizard} from "./ion-simple-wizard.component";
import {IonSimpleWizardStep} from "./ion-simple-wizard.step.component";
import {TranslatorPipe} from "../../pipes/translator.pipe";

@NgModule({
  declarations: [ IonSimpleWizard, IonSimpleWizardStep ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(IonSimpleWizard),
    IonicPageModule.forChild(IonSimpleWizardStep)
  ],
  exports: [ IonSimpleWizard, IonSimpleWizardStep ]
})
export class IonSimpleWizardModule {

}