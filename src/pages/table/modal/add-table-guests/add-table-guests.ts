import {ViewController, NavParams, ToastController} from 'ionic-angular';
import { Component } from '@angular/core';
import {TableArrangementService} from "../../../../services/tableArrangementService";
import {TableStatus} from "../../../../model/tableArrangement";

@Component({
  selector: 'add-table-guests-modal',
  templateUrl: 'add-table-guests.html',
    styleUrls: ['/pages/table/modal/select-table/add-table-guests.scss']
})
export class AddTableGuestsModal {

  public table: any = {};
  public selectedSection: string;
  constructor(
    private tableArrangementService: TableArrangementService,
    private toastCtrl: ToastController,
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
  }

  async ionViewDidLoad() {
    this.table = this.navParams.get('table');
    const section = this.navParams.get('selectedSection');
    this.selectedSection = section.id;
    !this.table.numberOfGuests && ( this.table.numberOfGuests = 0 );
  }

  public dismiss() {
    this.viewCtrl.dismiss({ table: null});
  }

  public async save(){
    let toast = this.toastCtrl.create({
        message: `Number of guests should be greater than 0`,
        duration: 3000
    });
    this.table.numberOfGuests = Number(this.table.numberOfGuests);
    if(this.table.numberOfGuests <= 0){
        toast.present();
        return;
    }

    this.table.status = TableStatus.Open;
    await this.tableArrangementService.updateTable(this.table, this.selectedSection);

    this.viewCtrl.dismiss({ table: this.table});
  }


  
}