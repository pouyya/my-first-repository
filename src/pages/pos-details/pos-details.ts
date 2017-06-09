import { NavParams, NavController } from 'ionic-angular';
import { PosService } from './../../services/posService';
import { POS } from './../../model/pos';
import { Component } from '@angular/core';
@Component({
  selector: "pos-details",
  templateUrl: 'pos-details.html'
})
export class PosDetailsPage {
  public pos: POS = new POS();;
	public isNew: boolean = true;
	public action: string = 'Add';

  constructor(
    private navParams: NavParams,
    private posService: PosService,
    private navCtrl: NavController
  ) { }

  ionViewDidEnter() {
    var pos = this.navParams.get('pos');
    if(pos) {
      this.pos = pos;
      this.isNew = false;
      this.action = 'Edit'
    }
  }

  onSubmit() {
		if (this.isNew) {
			this.posService.add(this.pos)
				.catch(console.error.bind(console));
		} else {
			this.posService.update(this.pos)
				.catch(console.error.bind(console));
		}
		this.navCtrl.pop();
  }
}