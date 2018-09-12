import { Component } from '@angular/core';
import _ from 'lodash';
import { NavController, NavParams, ModalController, ToastController } from 'ionic-angular';
import { Utilities } from "../../utility";
import { TableArrangementService } from "../../services/tableArrangementService";
import {TableStatus} from "../../model/tableArrangement";

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
    let editTable = this.navParams.get('table');
    if (editTable) {
      this.tableItem = editTable;
      this.tableList = this.tableList.filter( item => item.id != this.tableItem.id);
      this.isNew = false;
      this.action = 'Edit';
    }else {
      this.tableItem.sectionId = this.sections[0].id;
      this.tableItem.id = (new Date()).toISOString();
      this.tableItem.createdAt = (new Date()).toISOString();
      this.tableItem.status = TableStatus.Closed;
    }
  }

  public async onSubmit() {
    try {
      let toast = this.toastCtrl.create({
          message: `Section '${this.tableItem.name}' has been created successfully!`,
          duration: 3000
      });
      const section = _.find(this.sections, {id: this.tableItem.sectionId});
      const tableNames = _.filter(this.tableList, {storeId: section.storeId}).map(item => item.name);

      if((tableNames as any).includes(this.tableItem.name)){
          toast.setMessage(`Table already present with the name '${this.tableItem.name}'. Please use a different name.`);
          toast.present();
          return;
      }
      if(this.tableItem.size <= 0){
          toast.setMessage(`Table size should be greater than 0.`);
          toast.present();
          return;
      }

      this.tableItem.storeId = section.storeId;
      await this.tableArrangementService[this.isNew ? 'addTable':'updateTable'](this.tableItem);
      toast.present();
      this.navCtrl.pop();
    } catch (err) {
      throw new Error(err);
    }
  }

  public async delete() {
    try {
      const deleteItem = await this.utility.confirmRemoveItem("Do you really want to delete this table!");
      if(!deleteItem){
          return;
      }
      await this.tableArrangementService.deleteTable(this.tableItem._id);
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
