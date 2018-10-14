import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { Utilities } from "../../utility";
import { SyncContext } from "../../services/SyncContext";
import { StoreService } from "../../services/storeService";
import { TableArrangementService } from "../../services/tableArrangementService";
import { Events } from 'ionic-angular';

@Component({
  selector: 'section-details',
  templateUrl: 'section-details.html'
})
export class SectionDetails {
  public sectionItem: any = {};
  public isNew = true;
  public action = 'Add';
  private allSectionNames: string[] = [];
  private stores = [];
  private selectedStore;

  constructor(public navCtrl: NavController,
    private syncContext: SyncContext,
    private tableArrangementService: TableArrangementService,
    private storeService: StoreService,
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    public events: Events,
    private utility: Utilities) {
  }

  async ionViewDidLoad() {
    this.stores = this.navParams.get('storeList');
    this.allSectionNames = this.navParams.get('allSectionNames') || [];
    let editSection = this.navParams.get('section');
    this.selectedStore = this.navParams.get('selectedStore');

    if (editSection) {
      this.sectionItem = editSection;
      this.allSectionNames.splice(this.allSectionNames.indexOf(this.sectionItem.name), 1);
      this.isNew = false;
      this.action = 'Edit';
    } else {
      this.sectionItem.id = (new Date()).toISOString();
      this.sectionItem.createdAt = (new Date()).toISOString();
      this.sectionItem.storeId = this.selectedStore;
    }
  }

  public async onSubmit() {
    try {
      let toast = this.toastCtrl.create({
        message: `Section '${this.sectionItem.name}' has been created successfully!`,
        duration: 3000
      });
      if ((this.allSectionNames as any).includes(this.sectionItem.name)) {
        toast.setMessage(`Section already present with the name '${this.sectionItem.name}'. Please use a different name.`);
        toast.present();
        return;
      }
      await this.tableArrangementService[this.isNew ? 'addSection' : 'updateSection'](this.sectionItem);
      toast.present();
      this.events.publish('sectionItem.storeId', this.sectionItem.storeId);
      this.navCtrl.pop();
    } catch (err) {
      throw new Error(err);
    }
  }



  public async delete() {
    try {
      const deleteItem = await this.utility.confirmRemoveItem("Do you really want to delete this section!");
      if (!deleteItem) {
        return;
      }
      await this.tableArrangementService.deleteSection(this.sectionItem._id);
      let toast = this.toastCtrl.create({
        message: `Section '${this.sectionItem.name}' has been deleted successfully!`,
        duration: 3000
      });
      toast.present();
      this.navCtrl.pop();
    } catch (err) {
      throw new Error(err);
    }
  }

}
