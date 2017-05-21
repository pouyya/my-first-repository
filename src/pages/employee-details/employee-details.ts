import { Store } from './../../model/store';
import { StoreService } from './../../services/storeService';
import {Component, OnInit, NgZone} from "@angular/core";
import {Employee} from "../../model/employee";
import {EmployeeService} from "../../services/employeeService";
import { NavParams, Platform, NavController } from "ionic-angular";

@Component({
  selector: 'employee-detail',
  templateUrl: 'employee-details.html'
})
export class EmployeeDetails {

  public item:any={};
  public isNew = true;
  public action = 'Add';
  public stores: Array<Store>;

  constructor(private employeeService: EmployeeService, 
    private zone: NgZone,
    private storeService: StoreService,
    private navParams: NavParams,
    private platform: Platform,
    public navCtrl: NavController) {
  }


  ionViewDidLoad()
  {
    let currentItem = this.navParams.get('item');
    if(currentItem){
        this.item = currentItem;
        this.isNew = false;
        this.action = 'Edit';
    }

    this.platform.ready().then(() => 
    {
      this.storeService.getAll()
                  .then(data => {
                      this.zone.run(() => {
                          this.stores = data;
                      });
                  })
                  .catch(console.error.bind(console));
          });
  }

  saveProducts(){
      if (this.isNew) {
          this.storeService.add(this.item)
              .catch(console.error.bind(console));
      } else {
          this.storeService.update(this.item)
              .catch(console.error.bind(console));
      }
      this.navCtrl.pop();
  }

}
