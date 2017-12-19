import { ProductService } from './../../services/productService';
import _ from 'lodash';
import { NgZone } from '@angular/core';
import { LoadingController, Platform, NavController, AlertController } from 'ionic-angular';
import { BrandService } from './../../services/brandService';
import { Component } from '@angular/core';
import { InventoryModule } from '../../modules/inventoryModule';
import { PageModule } from '../../metadata/pageModule';
import { Brand } from '../../model/brand';
import { AlertOptions } from 'ionic-angular/components/alert/alert-options';
import { BrandDetails } from '../brand-details/brand-details';

interface PageBrand extends Brand {
  associatedProducts: number;
}

@PageModule(() => InventoryModule)
@Component({
  selector: 'brands',
  templateUrl: 'brands.html'
})
export class Brands {

  public brands: PageBrand[];
  public brandsBackup: PageBrand[];

  constructor(
    private brandService: BrandService,
    private productService: ProductService,
    private loading: LoadingController,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private platform: Platform,
    private zone: NgZone) {

  }

  async ionViewDidEnter() {
    try {
      let loader = this.loading.create({ content: 'Loading Brands...' });
      await loader.present();
      this.brands = [];
      this.brandsBackup = [];
      let brands: Brand[] = await this.brandService.getAll();
      if (brands.length > 0) {
        let associations: any[] = [];
        brands.forEach((brand, index, array) => {
          associations.push(async () => {
            let products = await this.productService.getAllByBrand(brand._id);
            this.brands.push({
              ...array[index],
              associatedProducts: products.length
            });
            return;
          });
        });

        await Promise.all(associations.map(assoc => assoc()));
        await this.platform.ready();
        this.zone.run(() => {
          this.brandsBackup = this.brands;
          loader.dismiss();
        });
      } else {
        loader.dismiss();
      }
    } catch (err) {
      console.error(err);
      return;
    }
  }

  public view(brand?: PageBrand) {
    this.navCtrl.push(BrandDetails, { 
      brand: brand ? <Brand>_.omit(brand, ['associatedProducts']) : null
    });
  }

  public delete(brand: PageBrand, index: number) {
    let message: string = 'This Brand using in Products or Services. Do you want to delete this Category?';
    let confirmOptions: any = {
      title: 'Confirm Delete Brand?',
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            await this.brandService.delete(<Brand>_.omit(brand, ['associatedProducts']))
            this.brands.splice(index, 1);
          }
        },
        'No'
      ]
    };

    brand.associatedProducts > 0 && (confirmOptions['message'] = message);

    let confirm = this.alertCtrl.create(<AlertOptions>confirmOptions);
    confirm.present();
  }

  public search(event) {
    this.brands = this.brandsBackup;
    let val = event.target.value;

    if (val && val.trim() != '') {
      this.brands = this.brands.filter(brand => {
        return ((brand.name).toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }

}