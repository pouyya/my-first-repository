import { ViewController, NavParams, ModalController } from 'ionic-angular';
import { Component } from '@angular/core';
import { TableArrangementService } from "../../../../services/tableArrangementService";
import { TableArrangement, TableStatus } from "../../../../model/tableArrangement";
import { AddTableGuestsModal } from "../add-table-guests/add-table-guests";
import { SyncContext } from "../../../../services/SyncContext";

@Component({
    selector: 'select-tables-modal',
    templateUrl: 'select-tables.html',
    styleUrls: ['/pages/table/modal/select-table/select-tables.scss']
})
export class SelectTablesModal {

    public sections = [];
    public tables = [];
    public selectedSection;
    public emptyListSectionMessage: string;
    public emptyListTableMessage: string;

    constructor(
        private tableArrangementService: TableArrangementService,
        private navParams: NavParams,
        private viewCtrl: ViewController,
        private modalCtrl: ModalController,
        private syncContext: SyncContext
    ) {
    }

    async ionViewDidLoad() {
        this.emptyListSectionMessage = "No sections are present for this store. You need to create some in order to show it here.";
        this.emptyListTableMessage = "No tables present for this section";
        const tableArrangement: TableArrangement[] = await this.tableArrangementService.getAll();
        this.sections = tableArrangement[0].sections.filter(section => section.storeId === this.syncContext.currentStore._id);
        if (this.sections.length) {
            this.onSelectSection(this.sections[0]);
        }
    }

    public dismiss() {
        this.viewCtrl.dismiss({ table: null });
    }

    public onSelectSection(section) {
        if (this.selectedSection) {
            delete this.selectedSection.color;
        }
        section.color = "rgb(233, 236, 236)";
        this.selectedSection = section;
        this.tables = section.tables.map((table: any) => {
            switch (table.status) {
                case TableStatus.Open:
                    table.color = "rgb(157, 240, 255)";
                    break;
                case TableStatus.Active:
                    table.color = "rgb(28, 255, 133)";
                    break;
                case TableStatus.Closed:
                    delete table.color;
                    break;
            }
            return table;
        });
    }

    public onSelectTable(table) {
        if (table.status === TableStatus.Closed) {
            let modal = this.modalCtrl.create(AddTableGuestsModal, { table, selectedSection: this.selectedSection });
            modal.onDidDismiss((res) => {
                if (res && res.table) {
                    table = res.table;
                    table.color = "rgb(157, 240, 255)";
                }
            });
            modal.present();
        } else if (table.status === TableStatus.Open || table.status === TableStatus.Active) {
            this.viewCtrl.dismiss({ table, status: table.status });
        }

    }

}