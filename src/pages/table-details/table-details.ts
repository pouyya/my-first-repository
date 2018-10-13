import { Component } from '@angular/core';
import _ from 'lodash';
import { NavController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { Utilities } from "../../utility";
import { TableArrangementService } from "../../services/tableArrangementService";
import { TableStatus } from "../../model/tableArrangement";

@Component({
  selector: 'table-details',
  templateUrl: 'table-details.html'
})
export class TableDetails {
  public tableItem: any = {};
  public tableList = [];
  public isNew = true;
  public action = 'Add';
  private sections = [];
  private selectedSection: string;
  private fromSection: string;
  private moved: boolean = false;

  constructor(public navCtrl: NavController,
    private tableArrangementService: TableArrangementService,
    private navParams: NavParams,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private utility: Utilities) {
  }

  async ionViewDidLoad() {
    this.sections = this.navParams.get('sectionList');
    this.tableList = this.navParams.get('tableList') || [];
    this.selectedSection = this.navParams.get('selectedSection') || '';
    let editTable = this.navParams.get('table');
    if (editTable) {
      this.tableItem = editTable;
      this.tableList = this.tableList.filter(item => item.id != this.tableItem.id);
      this.isNew = false;
      this.action = 'Edit';
      this.fromSection = this.selectedSection;
    } else {
      this.selectedSection = this.sections[0].id;
      this.tableItem.id = (new Date()).toISOString();
      this.tableItem.createdAt = (new Date()).toISOString();
      this.tableItem.status = TableStatus.Closed;
    }
  }

  public async onSubmit() {
    const section = _.find(this.sections, { id: this.selectedSection });
    if (!this.isNew && section != this.fromSection)
      this.moved = true;
    try {
      let toast = this.toastCtrl.create({
        message: `Section '${this.tableItem.name}' has been ` + (!this.moved ? (this.isNew ? `created` : `updated`) : `moved`) + ` successfully!`,
        duration: 3000
      });

      const tableList = await this.tableArrangementService.getStoreTables(section.storeId);
      const tableNames = _.filter(tableList, { id: this.tableItem.id }).map(item => item.name);

      if (this.isNew)
        if ((tableNames as any).includes(this.tableItem.name)) {
          toast.setMessage(`Table already present with the name '${this.tableItem.name}'. Please use a different name.`);
          toast.present();
          return;
        }

      await this.tableArrangementService[this.isNew ? 'addTable' : 'updateTable'](this.tableItem, this.selectedSection, this.fromSection);
      toast.present();
      this.navCtrl.pop();
    } catch (err) {
      throw new Error(err);
    }
  }

  public async delete() {
    try {
      const deleteItem = await this.utility.confirmRemoveItem("Do you really want to delete this table!");
      if (!deleteItem) {
        return;
      }
      await this.tableArrangementService.deleteTable(this.tableItem.id, this.selectedSection);
      let toast = this.toastCtrl.create({
        message: `Section '${this.tableItem.name}' has been deleted successfully!`,
        duration: 3000
      });
      toast.present();
      this.navCtrl.pop();
    } catch (err) {
      throw new Error(err);
    }
  }


}
