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

  public item: any = {};
  public isNew = true;
  public action = 'Add';
  public stores: Array<{ id: string, store: Store, role: string }> = [];

  constructor(private employeeService: EmployeeService, 
    private zone: NgZone,
    private storeService: StoreService,
    private navParams: NavParams,
    private platform: Platform,
    public navCtrl: NavController) {
  }

  ionViewDidLoad() {
    let currentItem = this.navParams.get('item');
    if (currentItem) {
      this.item = currentItem;
      this.isNew = false;
      this.action = 'Edit';
    }

    this.platform.ready().then(() => {
      if(currentItem) {
        this.employeeService.getAssociatedStores(this.item.store)
            .then(stores => {
              this.stores = stores;
            })
      } else {
        this.storeService.getAll()
            .then(data => {
              this.zone.run(() => {
                data.forEach((store, index) => {
                  this.stores.push({id: store._id, store: store, role: 'staff'});
                });
              });
            })
            .catch(console.error.bind(console));
      }
    });
  }

  public save(): void {
    this.stores.forEach((store, index) => {
      delete this.stores[index].store;
    });
    this.item.store = this.stores;
    this.item.hasOwnProperty('name') && (delete this.item.name);
    if(this.isNew) {
      this.employeeService.add(this.item)
          .catch(console.error.bind(console));
    } else {
      this.employeeService.update(this.item)
          .catch(console.error.bind(console));
    }
    this.navCtrl.pop();
  }

  public remove(): void {
    this.employeeService.delete(this.item)
        .catch(console.error.bind(console));
  }

  public changeRole(role: string, id: string) {
    this.stores.forEach((store, index) => {
      if(store.id === id) {
        this.stores[index].role = role;
      }
    });
  }
}