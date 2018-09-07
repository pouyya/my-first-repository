import {
  NavParams, AlertController, LoadingController,
  ViewController
} from 'ionic-angular';
import { Component } from '@angular/core';


@Component({
  selector: "table-details-modal",
  templateUrl: 'table-details.html'
})
export class TableDetailsModal {
  public table: any = {};
  public isNew: boolean = true;
  public action: string = 'Add';
  private navPopCallback: any;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController,
    private alertCtrl: AlertController,
    private loading: LoadingController
  ) { }

  async ionViewDidLoad() {
    let loader = this.loading.create({
      content: 'Loading Device...'
    });

    await loader.present();

    let table = this.navParams.get('table');

    this.navPopCallback = this.navParams.get("pushCallback");
    if (table && table._id !== "") {
      this.isNew = false;
      this.action = 'Edit';
      this.table = table;
    }
    loader.dismiss();
  }

  public dismiss() {
    this.viewCtrl.dismiss(null);
  }

  public async onSubmit() {
    this.viewCtrl.dismiss({ status: 'add', table: this.table });
  }

  public async remove() {
    let confirm = this.alertCtrl.create({
      title: 'Are you sure you want to delete this Table ?',
      message: 'Deleting this table!',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.loading.create({
              content: 'Deleting. Please Wait!',
            });
          }
        }, 'No'
      ]
    });

    confirm.present();
  }
}