import { ProductService } from './../../services/productService';
import _ from 'lodash';
import { NgZone } from '@angular/core';
import { LoadingController, Platform, NavController, AlertController, InfiniteScroll } from 'ionic-angular';
import { BrandService } from './../../services/brandService';
import { Component } from '@angular/core';
import { InventoryModule } from '../../modules/inventoryModule';
import { PageModule } from '../../metadata/pageModule';
import { Brand } from '../../model/brand';
import { AlertOptions } from 'ionic-angular/components/alert/alert-options';
import { BrandDetails } from '../brand-details/brand-details';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { SearchableListing } from "../../modules/searchableListing";

interface PageBrand extends Brand {
    associatedProducts: number;
}

@SecurityModule(SecurityAccessRightRepo.BrandListing)
@PageModule(() => InventoryModule)
@Component({
    selector: 'brands',
    templateUrl: 'brands.html'
})
export class Brands extends SearchableListing<Brand> {

    public items: PageBrand[] = [];

    constructor(brandService: BrandService,
        private productService: ProductService,
        private loading: LoadingController,
        private navCtrl: NavController,
        private alertCtrl: AlertController,
        private platform: Platform,
        protected zone: NgZone) {

        super(brandService, zone, 'Brand');
    }

    async ionViewDidEnter() {
        try {
            let loader = this.loading.create({ content: 'Loading Brands...' });
            await loader.present();
            await this.fetch();
            loader.dismiss();
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

    public async fetchMore(infiniteScroll?: InfiniteScroll) {
        let brands: Brand[] = await this.loadData();
        let pageBrands: PageBrand[] = [];
        let associations: any[] = [];
        brands.forEach((brand, index, array) => {
            associations.push(async () => {
                let products = await this.productService.getAllByBrand(brand._id);
                pageBrands.push({
                    ...array[index],
                    associatedProducts: products.length
                });
                return;
            });
        });
        await Promise.all(associations.map(assoc => assoc()));
        await this.platform.ready();
        this.offset += pageBrands ? pageBrands.length : 0;
        this.zone.run(() => {
            this.items = this.items.concat(pageBrands);
            infiniteScroll && infiniteScroll.complete();
        });
    }

    public async remove(brand: PageBrand, index: number) {
        let message: string = 'This Brand using in Products or Services. Do you want to delete this Category?';
        let confirmOptions: any = {
            title: 'Confirm Delete Brand?',
            buttons: [
                {
                    text: 'Yes',
                    handler: async () => {
                        await super.remove(<Brand>brand, index);
                    }
                },
                'No'
            ]
        };

        brand.associatedProducts > 0 && (confirmOptions['message'] = message);

        let confirm = this.alertCtrl.create(<AlertOptions>confirmOptions);
        confirm.present();
    }

}