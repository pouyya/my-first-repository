// core
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { MaterialModule, MdInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// pages
import { ShortCutsApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { InventoryPage } from '../pages/inventory/inventory';
import { Products } from '../pages/products/products';
import { ProductDetails } from '../pages/product-details/product-details';
import { Category } from '../pages/category/category';
import { CategoryDetails } from '../pages/category-details/category-details';
import { Services } from '../pages/service/service';
import { ServiceDetails } from '../pages/service-details/service-details';
import { Sales } from '../pages/sales/sales';
import { Settings } from '../pages/settings/settings';
import { Stores } from '../pages/stores/stores';
import { PaymentsPage } from "../pages/payment/payment";
import { CashModal } from '../pages/payment/modals/cash/cash';
import { CreditCardModal } from './../pages/payment/modals/credit-card/credit-card';
import { EmployeeDetails } from '../pages/employee-details/employee-details';
import { Employees } from './../pages/employees/employees';
import { SwitchPosModal } from './modals/switch-pos/switch-pos';
import { OpenCloseRegister } from './../pages/open-close-register/open-close-register';
import { ParkSale } from './../pages/sales/modals/park-sale';
import { StoreDetailsPage } from './../pages/store-details/store-details';

// components
import { TileItemsModule } from '../components/tile-items/tile-items.module';
import { BasketModule } from './../components/basket/basket.module';

// services
import { ProductService } from '../services/productService';
import { ServiceService } from '../services/serviceService';
import { CategoryService } from '../services/categoryService';
import { StoreService } from "../services/storeService";
import { EmployeeService } from "../services/employeeService";
import { TaxService } from '../services/taxService';
import { CalculatorService } from './../services/calculatorService';
import { PosService } from "../services/posService";
import { PosDetailsPage } from './../pages/pos-details/pos-details';
import { UserSettingsService } from './../services/userSettingsService';
import { UserService } from './../services/userService';
import { ClosureService } from './../services/closureService';
import { ModuleService } from './../services/moduleService';
import { HelperService } from './../services/helperService';

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': "036318f3"
  }
};

@NgModule({
  declarations: [
    ShortCutsApp,
    HomePage,
    InventoryPage,
    Products,
    ProductDetails,
    Services,
    ServiceDetails,
    Category,
    CategoryDetails,
    Sales,
    Settings,
    Stores,
    StoreDetailsPage,
    EmployeeDetails,
    Employees,
    PaymentsPage,
    CashModal,
    CreditCardModal,
    ParkSale,
    PosDetailsPage,
    OpenCloseRegister,
    SwitchPosModal
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    IonicModule.forRoot(ShortCutsApp,{backButtonText:'',}),
    CloudModule.forRoot(cloudSettings),
    IonicStorageModule.forRoot({
      name:'__mydb',
      driverOrder:['indexeddb', 'sqlite', 'websql']
    }),
    MaterialModule,
    MdInputModule,
    BrowserAnimationsModule,

    // custom
    TileItemsModule,
    BasketModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ShortCutsApp,
    HomePage,
    InventoryPage,
    Products,
    ProductDetails,
    Services,
    ServiceDetails,
    Category,
    CategoryDetails,
    Sales,
    Settings,
    Stores,
    StoreDetailsPage,
    EmployeeDetails,
    Employees,
    PaymentsPage,
    CashModal,
    CreditCardModal,
    ParkSale,
    PosDetailsPage,
    OpenCloseRegister,
    SwitchPosModal
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ProductService,
    ServiceService,
    CategoryService,
    StoreService,
    EmployeeService,
    TaxService,
    CalculatorService,
    PosService,
    HelperService,
    ModuleService,
    ClosureService,
    UserService,
    UserSettingsService
  ]
})
export class AppModule {}
