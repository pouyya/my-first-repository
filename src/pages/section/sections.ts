import { Component, NgZone } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import {TableManagementModule} from "../../modules/TableManagementModule";
import {SectionDetails} from "../section-details/section-details";
import {SyncContext} from "../../services/SyncContext";
import {StoreService} from "../../services/storeService";
import {TableArrangementService} from "../../services/tableArrangementService";
import {ISection} from "../../model/tableArrangement";

@SecurityModule(SecurityAccessRightRepo.TableManagement)
@PageModule(() => TableManagementModule)
@Component({
  selector: 'sections',
  templateUrl: 'sections.html'
})
export class Sections {
  public emptyListMessage: string;
  public sectionList: ISection[] = [];
  public sections: ISection[] = [];
  public storeList = [];
  public selectedStore = "";

  constructor(public navCtrl: NavController,
    private tableArrangementService: TableArrangementService,
    private storeService: StoreService,
    private loading: LoadingController,
    private syncContext: SyncContext) {
  }

  async ionViewDidEnter() {
    let loader = this.loading.create({ content: 'Loading Sections...' });
    await loader.present();
    this.emptyListMessage = "No sections present for this store";
    try {
      this.storeList = await this.storeService.getAll();
      this.sectionList = await this.tableArrangementService.getAllSections();
      this.selectedStore = this.syncContext.currentStore._id;
      this.filterByStore();
      loader.dismiss();
    } catch (err) {
      console.error(new Error(err));
      loader.dismiss();
      return;
    }
  }

  showDetail(section) {
    const allSectionNames = this.sections.map(item => item.name);
    this.navCtrl.push(SectionDetails, { section, allSectionNames, storeList: this.storeList });
  }


  public async onSelectTile(event){
      this.showDetail(event);
  }

  public filterByStore(){
    this.sections = this.sectionList.filter(section => section.storeId === this.selectedStore);
  }
} 