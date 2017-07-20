import _ from 'lodash';
import { GroupSaleTaxDetailsPage } from './../group-sale-tax-details/group-sale-tax-details';
import { GroupSalesTaxService } from './../../../services/groupSalesTaxService';
import { Platform, NavController } from 'ionic-angular';
import { GroupSaleTax } from './../../../model/groupSalesTax';
import { Component, NgZone } from '@angular/core';

@Component({
  selector: "group-sale-tax",
  templateUrl: "group-sale-tax.html"
})
export class GroupSaleTaxPage {

  public groupSaleTaxes: Array<GroupSaleTax> = [];

  constructor(
    private platform: Platform,
    private zone: NgZone,
    private groupSalesTaxService: GroupSalesTaxService,
    private navCtrl: NavController
  ) {
    
  }

  ionViewDidEnter() {
    this.platform.ready().then(() => {
      this.groupSalesTaxService.getForUser().then((groups: Array<GroupSaleTax>) => {
        this.zone.run(() => {
          // TODO: Don't know why but the code is also retrieving SaleTex objects
          this.groupSaleTaxes = _.filter(groups, (group) => {
            return group.entityTypeName === 'GroupSaleTax';
          });
        })
      }).catch((error) => {
        throw new Error(error);
      });
    }).catch((error) => {
      throw new Error(error);
    });
  }
  
  public upsert(group?: GroupSaleTax) {
    let args: Array<any> = [GroupSaleTaxDetailsPage, { group } || false];
    this.navCtrl.push.apply(this.navCtrl, args);
  }

}