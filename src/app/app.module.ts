import { AppSettingsService } from './../services/appSettingsService';
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
import { CacheFactory } from 'cachefactory';

// pages
import { ShortCutsApp } from './app.component';
import { DeployPage } from './../pages/deploy/deploy';
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
import { SalesHistoryPage } from './../pages/sales-history/sales-history';
import { ItemInfoModal } from './../components/basket/item-info-modal/item-info';
import { CategoryIconSelectModal } from './../pages/category-details/modals/category-icon-select/category-icon-select';
import { GroupSaleTaxDetailsPage } from './../pages/admin/group-sale-tax-details/group-sale-tax-details';
import { GroupSaleTaxPage } from './../pages/admin/group-sale-tax/group-sale-tax';
import { SaleTaxDetails } from './../pages/admin/sale-tax-details/sale-tax-details';
import { SaleTaxPage } from './../pages/admin/sale-tax/sale-tax';

// components
import { TileItemsModule } from '../components/tile-items/tile-items.module';
import { BasketModule } from './../components/basket/basket.module';
import { PurchasableItemInfoModule } from './../components/purchasable-Item-info/purchasable-Item-info.module';
import { IconSelectModule } from './../components/icon-select/icon-select.module';
import { ItemPriceBookModule } from './../components/item-price-book/item-price-book.module';
import { SPIconModule } from './../components/sp-icon/sp-icon.module';

// pipes
import { KeysPipe } from './../pipes/keys.pipe';
import { RoundToPipe } from "../pipes/round.pipe";

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
import { CacheService } from "../services/cacheService";
import { FountainService } from './../services/fountainService';
import { PriceBookService } from './../services/priceBookService';
import { GroupSalesTaxService } from './../services/groupSalesTaxService';
import { SalesTaxService } from './../services/salesTaxService';
import { AppService } from "../services/appService";
import { SharedModule } from "../modules/sharedModule";

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': "5bf5f6a2"
  }
};

@NgModule({
  declarations: [
    ShortCutsApp,
    DeployPage,
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
    SalesHistoryPage,
    SwitchPosModal,
    ItemInfoModal,
    SaleTaxPage,
    SaleTaxDetails,
    GroupSaleTaxPage,
    GroupSaleTaxDetailsPage,
    CategoryIconSelectModal,
    KeysPipe
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
    SharedModule,
    TileItemsModule,
    BasketModule,
    PurchasableItemInfoModule,
    IconSelectModule,
    SPIconModule,
    ItemPriceBookModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    ShortCutsApp,
    DeployPage,
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
    SalesHistoryPage,
    SwitchPosModal,
    ItemInfoModal,
    SaleTaxPage,
    SaleTaxDetails,
    GroupSaleTaxPage,
    GroupSaleTaxDetailsPage,
    CategoryIconSelectModal
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    CacheFactory,
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
    UserSettingsService,
    CacheService,
    FountainService,
    PriceBookService,
    SalesTaxService,
    GroupSalesTaxService,
    AppSettingsService,
    AppService,
    RoundToPipe
  ]
})
export class AppModule {}
