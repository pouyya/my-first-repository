// core
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorHandler, NgModule, Injector } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { DatePipe } from '@angular/common';
import { MatInputModule, MatGridListModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CacheFactory } from 'cachefactory';
import { DndModule } from 'ng2-dnd';
import { PinDialog } from '@ionic-native/pin-dialog';
import { Firebase } from '@ionic-native/firebase';
import { Dialogs } from '@ionic-native/dialogs';
import { Insomnia } from '@ionic-native/insomnia';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Network } from '@ionic-native/network';
import { SharedModule } from './../modules/shared.module';
import { authProvider } from './../modules/auth.module';

// pages
import { SimplePOSApp } from './app.component';
import { LoginPage } from './../pages/login/login';
import { LogOut } from './../pages/logout/logout';
import { HomePage } from '../pages/home/home';
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
import { SelectRolesModal } from './../pages/employee-details/modals/select-roles/select-roles'
import { Customers } from './../pages/customers/customers';;
import { CreateCustomerModal } from './../components/basket/modals/create-customer/create-customer';
import { DataSync } from '../pages/dataSync/dataSync';
import { AboutPage } from './../pages/about/about';
import { CustomerDetails } from '../pages/customer-details/customer-details';
import { StockIncreaseModal } from '../pages/product-details/modals/stock-increase/stock-increase';
import { Brands } from '../pages/brands/brands';
import { BrandDetails } from './../pages/brand-details/brand-details';
import { Suppliers } from '../pages/suppliers/suppliers';
import { SupplierDetails } from './../pages/supplier-details/supplier-details';
import { Orders } from '../pages/orders/orders';
import { OrderDetails } from './../pages/order-details/order-details';
import { AddSupplierAndStore } from '../pages/order-details/modals/addSupplierAndStore/addSupplierAndStore';
import { CreateSupplier } from '../pages/order-details/modals/createSupplier/createSupplier';
import { AddProducts } from '../pages/order-details/modals/addProducts/addProducts';
import { Closures } from './../pages/closures/closures';

// components
import { TileItemsModule } from '../components/tile-items/tile-items.module';
import { BasketModule } from './../components/basket/basket.module';
import { PurchasableItemInfoModule } from './../components/purchasable-item-info/purchasable-item-info.module';
import { PurchasableItemPriceModule } from './../components/purchasable-item-price/purchasable-item-price.module';
import { IconSelectModule } from './../components/icon-select/icon-select.module';
import { ItemPriceBookModule } from './../components/item-price-book/item-price-book.module';
import { SPIconModule } from './../components/sp-icon/sp-icon.module';
import { TileScrollableModule } from './../components/tiles-scrollable/tiles-scrollable.module';
import { SelectPurchasableItemsModel } from './../components/purchasable-item-price/modals/select-items';
import { GroupEmployeeTimeLogModule } from './../components/group-employee-timelog/group-employee-timelog.module';
import { BarcodeScannerModule } from './../components/barcode-scanner/barcode-scanner.module';
import { NetworkMonitorModule } from '../components/network-monitor/network-monitor.module';

// pipes
import { KeysPipe } from './../pipes/keys.pipe';
import { GroupByPipe } from './../pipes/group-by.pipe';
import { LocalDatePipe } from '../pipes/local-date.pipe';

// directives
import { ClickStopPropagation } from './../directives/clickStopPropagation.directive';

// services
import { DateTimeService } from './../services/dateTimeService';
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
import { CustomerService } from './../services/customerService';
import { PrintService } from '../services/printService';
import { SecurityService } from '../services/securityService';
import { PlatformService } from '../services/platformService';
import { AccountSettingService } from '../services/accountSettingService';
import { StockHistoryService } from './../services/stockHistoryService';
import { StockDecreaseModal } from '../pages/product-details/modals/stock-decrease/stock-decrease';
import { BrandService } from '../services/brandService';
import { DeployPage } from '../pages/deploy/deploy';
import { IonicProDeployModule } from '../modules/ionicpro-deploy/ionic-pro-deploy.module';
import { ConfigService } from '../services/configService';
import { SupplierService } from '../services/supplierService';
import { OrderService } from './../services/orderService';
import { ResourceService } from '../services/resourceService';

@NgModule({
  declarations: [
    SimplePOSApp,
    LoginPage,
    LogOut,
    DataSync,
    HomePage,
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
    TimeLogDetailsModal,
    SelectRolesModal,
    Customers,
    CustomerDetails,
    CreateCustomerModal,
    AboutPage,
    StockIncreaseModal,
    StockDecreaseModal,
    Brands,
    BrandDetails,
    DeployPage,
    Suppliers,
    SupplierDetails,
    Orders,
    OrderDetails,
    AddSupplierAndStore,
    CreateSupplier,
    AddProducts,
    Closures
  ],
  imports: [
    FormsModule,
    HttpModule,
    IonicModule.forRoot(SimplePOSApp,
      {
        backButtonText: '',
        modalEnter: 'modal-slide-in',
        modalLeave: 'modal-slide-out',
        pageTransition: 'ios-transition',
        platforms: {
          android: {
            activator: 'none'
          }
        }
      }),
    IonicStorageModule.forRoot({
      name: '__simpleposlocal',
      driverOrder: ['sqlite', 'indexeddb', 'websql']
    }),
    MatGridListModule,
    MatInputModule,
    BrowserAnimationsModule,
    DndModule.forRoot(),
    ReactiveFormsModule,

    // custom
    SharedModule,
    NetworkMonitorModule,
    TileItemsModule,
    BasketModule,
    PurchasableItemInfoModule,
    PurchasableItemPriceModule,
    IconSelectModule,
    SPIconModule,
    ItemPriceBookModule,
    TileScrollableModule,
    GroupEmployeeTimeLogModule,
    BarcodeScannerModule,
    IonicProDeployModule.forRoot({
      appId: ConfigService.ionicDeployAppId(),
      channel: ConfigService.ionicDeployAppChannel()
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    SimplePOSApp,
    DataSync,
    LoginPage,
    LogOut,
    HomePage,
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
    TimeLogDetailsModal,
    SelectRolesModal,
    Customers,
    CustomerDetails,
    CreateCustomerModal,
    AboutPage,
    StockIncreaseModal,
    StockDecreaseModal,
    Brands,
    BrandDetails,
    DeployPage,
    Suppliers,
    SupplierDetails,
    Orders,
    OrderDetails,
    AddSupplierAndStore,
    CreateSupplier,
    AddProducts,
    Closures
  ],
  providers: [
    { provide: ErrorHandler, useClass: AppErrorHandler },
    StatusBar,
    SplashScreen,
    Network,
    Firebase,
    PinDialog,
    Dialogs,
    Insomnia,
    InAppBrowser,
    DatePipe,
    SharedService,
    CacheFactory,
    DateTimeService,
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
    SecurityService,
    PluginService,
    EmployeeTimestampService,
    StockHistoryService,
    CustomerService,
    AuthService,
    StoreEvaluationProvider,
    DaysOfWeekEvaluationProvider,
    AppService,
    PrintService,
    BrandService,
    StoreService,
    SalesServices,
    ClickStopPropagation,
    KeysPipe,
    GroupByPipe,
    LocalDatePipe,
    authProvider,
    PlatformService,
    AccountSettingService,
    SupplierService,
    OrderService,
    ResourceService
  ]
})
export class AppModule {
  constructor(injector: Injector) {
    window.globalInjector.emit(injector);
  }
}