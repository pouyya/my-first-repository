import { ViewController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';
import {TableArrangementService} from "../../../../services/tableArrangementService";
import {TableArrangement, TableStatus} from "../../../../model/tableArrangement";

@Component({
  selector: 'select-tables-modal',
  templateUrl: 'select-tables.html',
  styleUrls: ['/pages/table/modal/select-table/select-tables.scss']
})
export class SelectTablesModal {

  public sections = [];
  private allTables = [];
  public tables = [];
  public selectedSection;
  public emptyListSectionMessage: string;
  public emptyListTableMessage: string;

  constructor(
    private tableArrangementService: TableArrangementService,
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
  }

  async ionViewDidLoad() {
    this.emptyListSectionMessage = "No sections are present for this user. You need to create some in order to show it here.";
    this.emptyListTableMessage= "No tables present for this section";
    const tableArrangement: TableArrangement[] = await this.tableArrangementService.getAll();
    this.sections = tableArrangement[0].sections;
    this.allTables = tableArrangement[0].tables;
    this.onSelectSection(this.sections[0]);
  }

  public dismiss() {
    this.viewCtrl.dismiss({ });
  }

  public onSelectSection(section){
    if(this.selectedSection){
        delete this.selectedSection.color;
    }
    section.color = "rgb(233, 236, 236)" ;
    this.selectedSection = section;
    this.tables = this.allTables.filter(( table: any ) => {
        table.status === TableStatus.Open && (table.color = "rgb(157, 240, 255)");
      return table.sectionId === section.id;
    });
  }

  public onSelectTable(){

  }
  
}