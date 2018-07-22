import { SharedModule } from './../../modules/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSimpleWizardComponent } from './ion-simple-wizard.component';
import { IonSimpleWizardStepComponent } from './ion-simple-wizard.step.component';
import { IonicPageModule } from 'ionic-angular';

@NgModule({
  declarations: [ IonSimpleWizardComponent , IonSimpleWizardStepComponent ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(IonSimpleWizardComponent),
    IonicPageModule.forChild(IonSimpleWizardStepComponent),
    SharedModule
  ],
  exports: [ IonSimpleWizardComponent , IonSimpleWizardStepComponent]
})
export class IonSimpleWizardModule { }