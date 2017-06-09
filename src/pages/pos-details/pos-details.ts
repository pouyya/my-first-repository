import {NavParams, NavController, ToastController} from 'ionic-angular';
import { PosService } from './../../services/posService';
import { POS } from './../../model/pos';
import { Component } from '@angular/core';
@Component({
  selector: "pos-details",
  templateUrl: 'pos-details.html'
})
export class PosDetailsPage {
  public pos: POS = new POS();
	public isNew: boolean = true;
	public action: string = 'Add';

  constructor(
    private navParams: NavParams,
    private posService: PosService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) { }

  ionViewDidEnter() {
    var pos = this.navParams.get('pos');
    var storeId = this.navParams.get('storeId');
    if(pos) {
      this.pos = pos;
      this.isNew = false;
      this.action = 'Edit'
    } else {
      this.pos.storeId = storeId;
    }
  }

  public save() {
		if (this.isNew) {
      this.pos._id = "748743vr749nwqthrn67chctr7";
			this.posService.add(this.pos).then(() => {
        let toast = this.toastCtrl.create({
          message: 'Register has been added successfully',
          duration: 3000
        });
        toast.present();
        this.navCtrl.pop();
      }, (error) => {
        throw new Error(error);
      })
		} else {
			this.posService.update(this.pos)
				.catch(console.error.bind(console));
		}
		this.navCtrl.pop();
  }

  public remove() {
    this.posService.delete(this.pos).then(() => {
      let toast = this.toastCtrl.create({
        message: 'Register has been deleted successfully',
        duration: 3000
      });
      toast.present();
      this.navCtrl.pop();
    });
  }
}