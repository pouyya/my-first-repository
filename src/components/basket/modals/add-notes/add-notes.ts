import { NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core';

@Component({
  selector: 'add-notes-modal',
  templateUrl: 'add-notes.html'
})
export class AddNotes {


  
  public notes;

  constructor(
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
      this.notes = this.navParams.get("notes");
  }

  public dismiss() {
    this.viewCtrl.dismiss();
  }

  public confirmChanges() {
    this.viewCtrl.dismiss(this.notes);
  }
}