import { SharedModule } from './../../modules/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSimpleWizardComponent } from './ion-simple-wizard.component';
import { IonSimpleWizardStepComponent } from './ion-simple-wizard.step.component';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [ IonSimpleWizardStepComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(IonSimpleWizardStepComponent),
    SharedModule
  ],
  exports: [ IonSimpleWizardStepComponent ]
})
export class IonSimpleWizardStepModule { }