import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { InventoryPage } from '../pages/inventory/inventory';
import { ProductsPage } from '../pages/products/products';
import { ProductsDetailsPage } from '../pages/productsDetails/productsDetails';

import { SalePage } from '../pages/sale/sale';
import { SetupPage } from '../pages/setup/setup';
import { TabsPage } from '../pages/tabs/tabs';
import { SettingsPage } from '../pages/settings/settings';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    InventoryPage,
    ProductsPage,
    ProductsDetailsPage,
    SalePage,
    SetupPage,
    SettingsPage,
    TabsPage

  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    InventoryPage,
    ProductsPage,
    ProductsDetailsPage,
    SalePage,
    SetupPage,
    SettingsPage,
    TabsPage

  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
