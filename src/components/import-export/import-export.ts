import { IonicPageModule } from 'ionic-angular';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ImportExportComponent } from "./import-export.component";
import { SelectFileModal } from "./modal/select-file/select-file";
import { ListFilesModal } from "./modal/list-files/list-files";

@NgModule({
  entryComponents: [SelectFileModal, ListFilesModal],
  declarations: [ ImportExportComponent, SelectFileModal, ListFilesModal ],
  imports: [ 
    CommonModule, 
    IonicPageModule.forChild(ImportExportComponent)
  ],
  exports: [ ImportExportComponent ]
})
export class ImportExportModule {

}