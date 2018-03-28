import { DeviceService } from './../../services/deviceService';
import { SalesServices } from './../../services/salesService';
import { Device } from './../../model/device';
import { Component } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';
import { SyncContext } from "../../services/SyncContext";
import {Sale} from "../../model/sale";

@Component({
  selector: 'bump-details',
  templateUrl: 'bump-details.html',
  styleUrls: ['/pages/bump-details/bump-details.scss']
})
export class BumpDetails {
  public sales = [];
  public showPrevious: boolean = false;
  public showNext: boolean = false;
  private limit: number = 6;
  private skip: number = 0;
  private device;
  private isBumpedViewSelected: boolean = false;

  constructor(public navCtrl: NavController,
    private deviceService: DeviceService,
    private salesService: SalesServices,
    private navParams: NavParams,
    private syncContext: SyncContext,
    private toastCtrl: ToastController) {
  }

  async ionViewDidLoad() {
    this.device = <Device>this.navParams.get('device');
    await this.showSales();
  }

  public async showSales(type?: string){
      switch (type) {
          case "next":
              this.skip += this.limit;
              this.skip > 0 && (this.showPrevious = true);
              break;
          case "prev":
              this.skip -= this.limit;
              this.skip === 0 && (this.showPrevious = false);
              break;
      }
      const currentDate = new Date();
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      const timeFrame = {startDate : startDate.toISOString(), endDate : endDate.toISOString()};
      const posId  = this.device.posIds.length && this.device.posIds[0] || this.syncContext.currentPos._id;
      const options = { state : 'completed', isBumped : false };
      if(this.isBumpedViewSelected){
          options['isBumped'] = true;
      }
      this.sales = await this.salesService.searchSales(posId, this.limit + 1 , this.skip, options,
          timeFrame);

      if(this.sales.length > this.limit ){
          this.showNext = true;
          this.sales.splice(this.limit);
      }else{
          this.showNext = false;
      }

      if(this.device.associatedPurchasableItemIds && this.device.associatedPurchasableItemIds.length){
          this.sales = this.sales.filter(sale => {
              sale.items = sale.items.filter(item => {
                  return (this.device.associatedPurchasableItemIds as any).includes(item.purchsableItemId)
              });
              if(sale.items.length){
                  sale.elapsedTime = Math.round((<any>currentDate - <any>new Date(sale.completedAt))/(1000*60));
                  return sale;
              }
          });
      }

  }

  public showView(type: string = "PENDING"){
    this.isBumpedViewSelected = false;
    if(type === "BUMPED"){
      this.isBumpedViewSelected = true;
    }
    this.skip = 0;
    this.showNext = false;
    this.showPrevious = false;
    this.showSales();
  }

  public async bump(sale, index){
      sale.items.forEach(item => {
          item.isBumped = true;
      });
      sale.isBumped = true;
      await this.salesService.update(sale);
      this.sales.splice(index, 1);
  }

  public async bumpItem(sale: Sale){
      await this.salesService.update(sale);
  }

  public async onSubmit() {
    /*try {
      this.brand.updatedAt = moment().utc().format();
      await this.brandService[this.isNew ? 'add' : 'update'](this.brand);
      let toast = this.toastCtrl.create({
        message: `Brand '${this.brand.name}' has been created successfully!`,
        duration: 3000
      });
      toast.present();
      this.navCtrl.pop();
    } catch (err) {
      throw new Error(err);
    }*/
  }

  public async delete() {
    /*try {
      await this.brandService.delete(this.brand);
      let toast = this.toastCtrl.create({
        message: `Brand '${this.brand.name}' has been deleted successfully!`,
        duration: 3000
      });
      toast.present();
      this.navCtrl.pop();
    } catch (err) {
      throw new Error(err);
    }*/
  }
}