import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { InventoryPage } from '../pages/inventory/inventory';

import { ProductsPage } from '../pages/products/products';
import { ProductsDetailsPage } from '../pages/productsDetails/productsDetails';

import { ServicesPage } from '../pages/service/service';
import { ServiceDetailsPage } from '../pages/serviceDetails/serviceDetails';

import { CategoryPage } from '../pages/category/category';
import { CategoryDetailsPage } from '../pages/category/categoryDetails';

import { AboutPage } from '../pages/about/about';
import { SalesPage } from '../pages/sales/sales';
import { SetupPage } from '../pages/setup/setup';
import { TabsPage } from '../pages/tabs/tabs';
import { SettingsPage } from '../pages/settings/settings';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { EcommercePage } from '../pages/ecommerce/ecommerce';
import { ReportPage } from '../pages/report/report';
import { ContactPage } from '../pages/contact/contact';

// components
import { TileItemsModule } from '../components/tile-items/tile-items.module';

import { ProductService } from '../services/productService';
import { ServiceService } from '../services/serviceService';
import { CategoryService } from '../services/categoryService';


const cloudSettings: CloudSettings = {
  'core': {
    'app_id': "036318f3"
  }
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    AboutPage,
    InventoryPage,
    ProductsPage,
    ContactPage,
    ProductsDetailsPage,
    ServicesPage,
    ServiceDetailsPage,
    CategoryPage,
    CategoryDetailsPage,
    SalesPage,
    SetupPage,
    SettingsPage,
    EcommercePage,
    ReportPage,
    TabsPage

  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp,{backButtonText:'',}),
    CloudModule.forRoot(cloudSettings),
    IonicStorageModule.forRoot({
      name:'__mydb',
      driverOrder:['indexeddb', 'sqlite', 'websql']
    }),

    // custom
    TileItemsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    AboutPage,
    InventoryPage,
    ProductsPage,
    ProductsDetailsPage,
    ServicesPage,
    ServiceDetailsPage,
    CategoryPage,
    CategoryDetailsPage,
    SalesPage,
    SetupPage,
    SettingsPage,
    EcommercePage,
    ReportPage,
    ContactPage,
    TabsPage

  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ProductService,
    ServiceService,
    CategoryService,
      
  ]
})
export class AppModule {}
