import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { InventoryPage } from '../pages/inventory/inventory';
import { ProductsPage } from '../pages/products/products';
import { ProductsDetailsPage } from '../pages/products/productsDetails';
import { AboutPage } from '../pages/about/about';
import { SalePage } from '../pages/sale/sale';
import { SetupPage } from '../pages/setup/setup';
import { TabsPage } from '../pages/tabs/tabs';
import { SettingsPage } from '../pages/settings/settings';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ProductService } from '../services/product.service';
import { EcommercePage } from '../pages/ecommerce/ecommerce';
import { ReportPage } from '../pages/report/report';

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
    ProductsDetailsPage,
    SalePage,
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
    })

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    AboutPage,
    InventoryPage,
    ProductsPage,
    ProductsDetailsPage,
    SalePage,
    SetupPage,
    SettingsPage,
    EcommercePage,
    ReportPage,
    TabsPage

  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ProductService
  ]
})
export class AppModule {}
