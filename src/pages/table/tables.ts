import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { TableManagementModule } from "../../modules/TableManagementModule";
import { StoreService } from "../../services/storeService";
import { TableDetails } from "../table-details/table-details";
import { ITable } from "../../model/tableArrangement";
import { TableArrangementService } from "../../services/tableArrangementService";
import { Events } from 'ionic-angular';
import { ISection } from "../../model/tableArrangement";
import { SyncContext } from "../../services/SyncContext";

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
  public sections: ISection[] = [];
  public storeList = [];
  public selectedStore = "";

  constructor(
    public navCtrl: NavController,
    private tableArrangementService: TableArrangementService,
    private storeService: StoreService,
    public events: Events,
    private loading: LoadingController,
    private syncContext: SyncContext
  ) { }

  async ionViewDidEnter() {
    if (!this.selectedStore)
      this.selectedStore = this.syncContext.currentStore._id;
    let loader = this.loading.create({ content: 'Loading Tables...' });
    await loader.present();
    try {
      this.storeList = await this.storeService.getAll();
      this.sectionList = await this.tableArrangementService.getAllSections() || [];
      if (!this.selectedSection) {
        if (this.sectionList.length>0) {
          this.selectedSection = this.sectionList[0].id;
        }
      }
      this.filterByStore();
      loader.dismiss();
    } catch (err) {
      console.error(new Error(err));
      loader.dismiss();
      return;
    }
  }

  showDetail(table) {
    this.events.subscribe('selectedSection', (selectedSection) => {
      this.selectedSection = selectedSection;
    });

    this.navCtrl.push(TableDetails, {
      table, sectionList: this.sectionList,
      tableList: this.tables, selectedSection: this.selectedSection
    });
  }


  public async onSelectTile(event) {
    this.showDetail(event);
  }

  public filterBySection() {
    if (!this.selectedSection) {
      this.tables = [];
      return;
    }
    const sections: any = this.sectionList.filter(section => section.id === this.selectedSection);
   ( sections.length>0) && (this.tables = sections[0].tables || []);
  }

  public filterByStore() {
    this.tables = [];
    this.sections = this.sectionList.filter(section => section.storeId === this.selectedStore);
    this.selectedSection =(this.sections.length>0)?  this.sections[0].id : "";
    (this.sections.length>0) && (this.tables = this.sections[0].tables || []);
    this.filterBySection();
  }

} 
