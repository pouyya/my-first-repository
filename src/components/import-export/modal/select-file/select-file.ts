import { Component, ElementRef, ViewChild } from '@angular/core';
import { ModalController, Platform, ViewController } from "ionic-angular";
import { ListFilesModal } from "../list-files/list-files";
import { PapaParseService } from "ngx-papaparse";

@Component({
    selector: "select-file",
    templateUrl: "./select-file.html",
    styleUrls: ['/components/select-file.scss']
})
export class SelectFileModal {
    @ViewChild('fileInput') fileInput: ElementRef;
    private requiredFields = ['ProductName', 'Barcode', 'SellPriceIncTax', 'SellTaxCode',
        'IsModifier', 'CategoryNames'];
    public displayFields = ['ProductName', 'CategoryNames'];

    public importedRecords: any[] = [];
    constructor(
        private viewCtrl: ViewController, private platform: Platform,
        private modalCtrl: ModalController, private papa: PapaParseService) {
    }

    public dismiss() {
        this.viewCtrl.dismiss({ status: false, products: null });
    }

    public importAll() {
        this.viewCtrl.dismiss({ status: true, importedRecords: this.importedRecords });
    }

    public openFileList() {
        if (this.platform.is('core') || this.platform.is('mobileweb')) {
            let event = new MouseEvent('click', { bubbles: false });
            this.fileInput.nativeElement.dispatchEvent(event);
        } else {
            let modal = this.modalCtrl.create(ListFilesModal);
            modal.onDidDismiss(data => {
                if (data.status) {
                    this.fileSelected({ target: { files: [data.file] } });
                }
            });
            modal.present();
        }
    }



    public fileSelected(evt) {
        if (evt && evt.target.files && evt.target.files.length) {
            this.papa.parse(evt.target.files[0], {
                dynamicTyping: true,
                header: true,
                complete: result => {
                    const data = result.data;
                    const importedRecords = data.map(csvData => {
                        const obj = {};
                        this.requiredFields.forEach(field => {
                            obj[field] = csvData[field];
                        });
                        return obj;
                    });
                    this.importedRecords = importedRecords;
                }
            });
        };
    }

}