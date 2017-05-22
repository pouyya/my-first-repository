import { StoreService } from './../../services/storeService';
import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, Platform } from 'ionic-angular';
import { StoreDetailsPage } from "../store-details/store-details";

@Component({
  templateUrl: 'stores.html'
})
export class Stores {

public stores = [];
public storesBackup = [];

  constructor(public navCtrl: NavController,
          private alertCtrl:AlertController,
          private storeService:StoreService,
          private platform:Platform,
          private zone: NgZone) {
  }

  ionViewDidEnter(){
     this.platform.ready().then(() => {

            this.storeService.getAll()
                .then(data => {
                    this.zone.run(() => {
                        this.stores = data;
                        this.storesBackup = data;
                    });
                })
                .catch(console.error.bind(console));
      });

  } 

  showDetail(store){
    this.navCtrl.push(StoreDetailsPage, {store:store}); 
  } 

  getItems(event){
    this.stores = this.storesBackup;
    var val = event.target.value;
    
    if(val && val.trim() != ''){
       this.stores = this.stores.filter((store)=>{
         return((store.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
       })
    }
  }

delete(item, idx){
    this.storeService.delete(item)
            .catch(console.error.bind(console)); 
    this.stores.splice(idx, 1);
  }
}