import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import {TableManagementModule} from "../../modules/TableManagementModule";
import {StoreService} from "../../services/storeService";
import {TableDetails} from "../table-details/table-details";
import {ITable} from "../../model/tableArrangement";
import {TableArrangementService} from "../../services/tableArrangementService";

@SecurityModule(SecurityAccessRightRepo.TableManagement)
@PageModule(() => TableManagementModule)
@Component({
  selector: 'tables',
  templateUrl: 'tables.html'
})
export class Tables {
  public emptyListMessage: string = "No tables present for this section";
  public tables: ITable[] = [];
  public sectionList = [];
  public selectedSection = "";

  constructor(public navCtrl: NavController,
    private tableArrangementService: TableArrangementService,
    private storeService: StoreService,
    private loading: LoadingController) {
  }

  async ionViewDidEnter() {
    let loader = this.loading.create({ content: 'Loading Tables...' });
    await loader.present();
    try {
      this.sectionList = await this.tableArrangementService.getAllSections() || [];
      if(this.sectionList.length){
        this.selectedSection = this.sectionList[0].id;
      }
      this.filterBySection();
      loader.dismiss();
    } catch (err) {
      console.error(new Error(err));
      loader.dismiss();
      return;
    }
  }

  showDetail(table) {
    this.navCtrl.push(TableDetails, { table, sectionList: this.sectionList,
        tableList: this.tables, selectedSection: this.selectedSection});
  }


  public async onSelectTile(event){
      this.showDetail(event);
  }

  public filterBySection(){
    if(!this.selectedSection){
      this.tables = [];
      return;
    }
    const sections: any = this.sectionList.filter(section => section.id === this.selectedSection);
    sections.length && ( this.tables = sections[0].tables || []);
  }
} 
