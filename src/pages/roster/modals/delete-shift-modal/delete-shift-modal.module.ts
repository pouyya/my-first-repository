import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DeleteShiftModalPage } from './delete-shift-modal';

@NgModule({
  declarations: [
    DeleteShiftModalPage,
  ],
  imports: [
    IonicPageModule.forChild(DeleteShiftModalPage),
  ],
})
export class DeleteShiftModalPageModule {}
