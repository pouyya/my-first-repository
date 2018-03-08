import { StoreService } from './../../services/storeService';
import { Component, NgZone } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { StoreDetailsPage } from "../store-details/store-details";
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { SearchableListing } from "../../modules/searchableListing";
import { Store } from "../../model/store";

@SecurityModule(SecurityAccessRightRepo.StoreListing)
@PageModule(() => BackOfficeModule)
@Component({
  templateUrl: 'stores.html'
})
export class Stores extends SearchableListing<Store>{

public items: Store[] = [];

  constructor(public navCtrl: NavController,
          private storeService:StoreService,
          private platform:Platform,
          protected zone: NgZone) {
      super(storeService, zone, 'Store');
  }

  async ionViewDidEnter(){
     await this.platform.ready();
     await this.fetchMore();

  } 

  showDetail(store){
    this.navCtrl.push(StoreDetailsPage, {store:store}); 
  } 

}