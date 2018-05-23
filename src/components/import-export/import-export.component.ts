import { Component, Input } from "@angular/core";
import { ModalController } from "ionic-angular";
import { SelectFileModal } from "./modal/select-file/select-file";
import { Subject } from "rxjs/Subject";

@Component({
  selector: 'import-export',
  template: `<button float-left ion-button small type="button" (click)="import()">Import</button>
  <button ion-button small type="button" (click)="export()">Export</button>`,
  styleUrls: ['/components/import-export.scss']
})
export class ImportExportComponent {
  @Input() importedRecords: Subject<Object[]>;
  constructor(private modalCtrl: ModalController) {
  }

  public selectColor() {

  }

  public import(){
      let modal = this.modalCtrl.create(SelectFileModal);
      modal.onDidDismiss(data => {
          if(data.status) {
              this.importedRecords.next(data.importedRecords);
          }
      });
      modal.present();
  }

  public export(){

  }
}