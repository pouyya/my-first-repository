// core
import { FormsModule }   from '@angular/forms';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { CloudSettings, CloudModule } from '@ionic/cloud-angular';
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CacheFactory } from 'cachefactory';
import { DndModule } from 'ng2-dnd';
import { PinDialog } from '@ionic-native/pin-dialog';
import { Firebase } from '@ionic-native/firebase';
import { Dialogs } from '@ionic-native/dialogs';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SharedModule } from './../modules/shared.module';

// pages
import { SimplePOSApp } from './app.component';
import { DeployPage } from './../pages/deploy/deploy';
import { LoginPage } from './../pages/login/login';
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
import { ForgotPassword } from './../pages/login/modals/forgot-password/forgot-password';
import { ClockInOutPage } from './../pages/clock-in-out/clock-in-out';
import { MoneyInOut } from './../pages/money-in-out/money-in-out';
import { MoveCashModal } from './../pages/money-in-out/modals/move-cash';
import { DiscountSurchargeModal } from './../components/basket/modals/discount-surcharge/discount-surcharge';
import { ViewDiscountSurchargesModal } from './../components/basket/modals/view-discount-surcharge/view-discount-surcharge';
import { PriceBooksPage } from './../pages/price-books/price-books';
import { PriceBookDetails } from './../pages/price-book-details/price-book-details';
import { StaffsTimeLogs } from './../pages/admin/staffs-time-logs/staffs-time-logs';
import { TimeLogDetailsModal } from './../pages/admin/staffs-time-logs/modals/time-log-details/time-log-details';

// components
import { TileItemsModule } from '../components/tile-items/tile-items.module';
import { BasketModule } from './../components/basket/basket.module';
import { PurchasableItemInfoModule } from './../components/purchasable-Item-info/purchasable-Item-info.module';
import { PurchasableItemPriceModule } from './../components/purchasable-item-price/purchasable-item-price.module';
import { IconSelectModule } from './../components/icon-select/icon-select.module';
import { ItemPriceBookModule } from './../components/item-price-book/item-price-book.module';
import { SPIconModule } from './../components/sp-icon/sp-icon.module';
import { TileScrollableModule } from './../components/tiles-scrollable/tiles-scrollable.module';
import { SelectPurchasableItemsModel } from './../components/purchasable-item-price/modals/select-items';
import { GroupEmployeeTimeLogModule } from './../components/group-employee-timelog/group-employee-timelog.module';

// pipes
import { KeysPipe } from './../pipes/keys.pipe';
import { GroupByPipe } from './../pipes/group-by.pipe';

// directives
import { ClickStopPropagation } from './../directives/clickStopPropagation.directive';

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
import { SalesServices } from './../services/salesService';
import { EmployeeTimestampService } from './../services/employeeTimestampService';
import { PluginService } from './../services/pluginService';
import { SharedService } from './../services/_sharedService';
import { StoreEvaluationProvider } from './../services/StoreEvaluationProvider';
import { DaysOfWeekEvaluationProvider } from './../services/DaysOfWeekEvaluationProvider';
import { AppErrorHandler } from './../services/AppErrorHandler';
import { AuthService } from './../services/authService';
import { authProvider } from './../modules/auth.module';

// used to create fake backend
import { fakeBackendProvider } from './../services/_fakeBackend';
import { MockBackend } from '@angular/http/testing';
import { BaseRequestOptions } from '@angular/http';

const cloudSettings: CloudSettings = {
  'core': {
    'app_id': "5bf5f6a2"
  }
};

@NgModule({
  declarations: [
    SimplePOSApp,
    DeployPage,
    LoginPage,
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
    ClockInOutPage,
    MoneyInOut,
    MoveCashModal,
    ForgotPassword,
    DiscountSurchargeModal,
    ViewDiscountSurchargesModal,
    PriceBooksPage,
    PriceBookDetails,    
    SelectPurchasableItemsModel,
    StaffsTimeLogs,
    TimeLogDetailsModal
  ],
  imports: [
    FormsModule,
    HttpModule,
    IonicModule.forRoot(SimplePOSApp,
      {
        backButtonText:'',
        platforms: { 
          android: { 
            activator: 'none' 
          }
        }         
      }),
    CloudModule.forRoot(cloudSettings),
    IonicStorageModule.forRoot({
      name:'__mydb',
      driverOrder:['sqlite', 'indexeddb', 'websql']
    }),
    BrowserAnimationsModule,
    DndModule.forRoot(),

    // custom
    SharedModule,
    TileItemsModule,
    BasketModule,
    PurchasableItemInfoModule,
    PurchasableItemPriceModule,
    IconSelectModule,
    SPIconModule,
    ItemPriceBookModule,
    TileScrollableModule,
    GroupEmployeeTimeLogModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    SimplePOSApp,
    DeployPage,
    LoginPage,
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
    ClockInOutPage,
    MoneyInOut,
    MoveCashModal,
    PriceBooksPage,
    PriceBookDetails,    
    ForgotPassword,
    ClockInOutPage,
    DiscountSurchargeModal,
    ViewDiscountSurchargesModal,
    SelectPurchasableItemsModel,
    StaffsTimeLogs,
    TimeLogDetailsModal
  ],
  providers: [
    {provide: ErrorHandler, useClass: AppErrorHandler},
    StatusBar,
    SplashScreen,
    Firebase,
    PinDialog,
    Dialogs,
    InAppBrowser,
    SharedService,
    CacheFactory,
    ProductService,
    ServiceService,
    CategoryService,
    EmployeeService,
    TaxService,
    CalculatorService,
    PosService,
    HelperService,
    ModuleService,
    ClosureService,
    UserService,
    CacheService,
    FountainService,
    PriceBookService,
    SalesTaxService,
    GroupSalesTaxService,
    PluginService,
    EmployeeTimestampService,
    AuthService,
    StoreEvaluationProvider,
    DaysOfWeekEvaluationProvider,
    AppService,
    StoreService,
    SalesServices,
    ClickStopPropagation,
    KeysPipe,
    GroupByPipe,
    authProvider,
    fakeBackendProvider,
    MockBackend,
    BaseRequestOptions    
  ]
})
export class AppModule {}
