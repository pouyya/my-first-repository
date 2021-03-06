// core
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorHandler, NgModule, Injector } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { MatInputModule, MatGridListModule } from '@angular/material';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CacheFactory } from 'cachefactory';
import { DndModule } from 'ng2-dnd';
import { PinDialog } from '@ionic-native/pin-dialog';
import { Dialogs } from '@ionic-native/dialogs';
import { Insomnia } from '@ionic-native/insomnia';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Network } from '@ionic-native/network';
import { SharedModule } from './../modules/shared.module';
import { authProvider } from './../modules/auth.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SortablejsModule } from 'angular-sortablejs';
// pages
import { SimplePOSApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { Products } from '../pages/products/products';
import { ProductDetails } from '../pages/product-details/product-details';
import { Categories } from '../pages/categories/categories';
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
import { Customers } from './../pages/customers/customers';
import { Bumps } from "../pages/bumps/bumps";
import { BumpDetails } from "../pages/bump-details/bump-details";
import { CreateCustomerModal } from './../components/basket/modals/create-customer/create-customer';
import { AboutPage } from './../pages/about/about';
import { CustomerDetails } from '../pages/customer-details/customer-details';
import { StockIncreaseModal } from '../pages/product-details/modals/stock-increase/stock-increase';
import { Brands } from '../pages/brands/brands';
import { BrandDetails } from './../pages/brand-details/brand-details';
import { Roles } from '../pages/roles/roles';
import { RoleDetails } from '../pages/role-details/role-details';
import { Suppliers } from '../pages/suppliers/suppliers';
import { SupplierDetails } from './../pages/supplier-details/supplier-details';
import { Orders } from '../pages/orders/orders';
import { OrderDetails } from './../pages/order-details/order-details';
import { AddSupplierAndStore } from '../pages/order-details/modals/addSupplierAndStore/addSupplierAndStore';
import { CreateSupplier } from '../pages/order-details/modals/createSupplier/createSupplier';
import { ProductsSelector } from '../pages/order-details/modals/products-selector/products-selector';
import { Closures } from './../pages/closures/closures';
import { DeleteAccount } from '../pages/delete-account/delete-account';


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
import { SearchableIonSelectModule } from './../components/searchable-ion-select/searchable-ion-select.module';
import { ColorPickerModule } from "../components/color-picker/color-picker.module";
import { ImagePickerModule } from "../components/image-picker/image-picker.module";
import { SelectColorModal } from "../components/color-picker/modal/select-color/select-color";
import { ImportExportModule } from "../components/import-export/import-export";

// pipes
import { KeysPipe } from './../pipes/keys.pipe';
import { GroupByPipe } from './../pipes/group-by.pipe';
import { LocalDatePipe } from '../pipes/local-date.pipe';
import { TranslatorPipe } from '../pipes/translator.pipe';

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
import { CustomerService } from './../services/customerService';
import { PrintService } from '../services/printService';
import { SecurityService } from '../services/securityService';
import { PlatformService } from '../services/platformService';
import { StockHistoryService } from './../services/stockHistoryService';
import { StockDecreaseModal } from '../pages/product-details/modals/stock-decrease/stock-decrease';
import { BrandService } from '../services/brandService';
import { DeployPage } from '../pages/deploy/deploy';
import { IonicProDeployModule } from 'ionicpro-deploy';
import { ServiceLocator } from '../services/serviceLocator';
import { RoleService } from '../services/roleService';
import { SupplierService } from '../services/supplierService';
import { OrderService } from './../services/orderService';
import { ResourceService } from '../services/resourceService';
import { DataSyncModule } from '../modules/dataSync/dataSyncModule';
import { AccountSettingService } from './../modules/dataSync/services/accountSettingService';
import { PaymentService } from '../services/paymentService';
import { AuditService } from '../services/auditService';
import { SyncContext } from "../services/SyncContext";
import { TranslateService } from "@ngx-translate/core";
import { DeviceDetailsModal } from "../pages/store-details/modals/device-details";
import { EmailService } from '../services/emailService';
import { PosDetailsModal } from "../pages/store-details/modals/pos-details";
import { AddNotes } from "../components/basket/modals/add-notes/add-notes";
import { Utilities } from "../utility/index";
import { ReportsDashboard } from "../pages/report-dashboard/report-dashboard";
import { ReportStockMovementSummaryPage } from "../pages/report-stock-movement-summary/report-stock-movement-summary";
import { Preferences } from "../pages/preferences/preferences";
import { SplitPaymentPage } from "../pages/split-payment/split-payment";
import { File } from "@ionic-native/file";
import { PapaParseModule } from "ngx-papaparse";
import { FileTransfer } from "@ionic-native/file-transfer";
import { Camera } from "@ionic-native/camera";
import { SelectLocationModal } from "../components/image-picker/modal/select-color/select-location";
import { DeleteAccountService } from './../services/deleteAccountService';
import { DateDurationPickerModule } from "../components/date-duration-picker/date-duration-picker.module";
import { DeployService } from '../services/deployService';
import { Roster } from "../pages/roster/roster";
import { HumanResourceDashboard } from "../pages/human-resource-dashboard/human-resource-dashboard";
import { CalendarModule } from "angular-calendar";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AddShiftDirective } from "../directives/shift.directive";
import { ShiftModalPage } from "../pages/roster/modals/shift-modal/shift-modal";
import { ShiftService } from "../services/shiftService";
import { IonSimpleWizardModule } from '../components/ion-simple-wizard/ion-simple-wizard.module';
import { CreateProductModal } from '../pages/product-details/modals/create-product/create-product';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    SimplePOSApp,
    HomePage,
    Products,
    ProductDetails,
    ReportsDashboard,
    HumanResourceDashboard,
    Preferences,
    ReportStockMovementSummaryPage,
    Services,
    ServiceDetails,
    Categories,
    CategoryDetails,
    Sales,
    Bumps,
    BumpDetails,
    Settings,
    Stores,
    StoreDetailsPage,
    EmployeeDetails,
    Employees,
    PaymentsPage,
    SplitPaymentPage,
    CashModal,
    CreateProductModal,
    CreditCardModal,
    ShiftModalPage,
    ParkSale,
    AddNotes,
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
    DeviceDetailsModal,
    PosDetailsModal,
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
    SelectColorModal,
    SelectLocationModal,
    AboutPage,
    StockIncreaseModal,
    StockDecreaseModal,
    Brands,
    BrandDetails,
    DeployPage,
    Roster,
    Roles,
    RoleDetails,
    Suppliers,
    SupplierDetails,
    Orders,
    OrderDetails,
    AddSupplierAndStore,
    CreateSupplier,
    ProductsSelector,
    Closures,
    TranslatorPipe,
    DeleteAccount,
    AddShiftDirective,
  ],
  imports: [
    FormsModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(SimplePOSApp,
      {
        mode: 'md',
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
    DataSyncModule.forRoot(),
    SortablejsModule.forRoot({
      animation: 100
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    PapaParseModule,
    NgbModule.forRoot(),
    CalendarModule.forRoot(),
    // custom
    SharedModule,
    NetworkMonitorModule,
    ColorPickerModule,
    ImagePickerModule,
    DateDurationPickerModule,
    ImportExportModule,
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
    SearchableIonSelectModule,
    IonSimpleWizardModule,
    IonicProDeployModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    SimplePOSApp,
    HomePage,
    Products,
    ProductDetails,
    ReportsDashboard,
    HumanResourceDashboard,
    ReportStockMovementSummaryPage,
    Preferences,
    Services,
    ServiceDetails,
    Categories,
    CategoryDetails,
    Sales,
    Bumps,
    BumpDetails,
    Settings,
    Stores,
    StoreDetailsPage,
    EmployeeDetails,
    Employees,
    PaymentsPage,
    SplitPaymentPage,
    CashModal,
    CreateProductModal,
    DeviceDetailsModal,
    PosDetailsModal,
    CreditCardModal,
    ShiftModalPage,
    ParkSale,
    AddNotes,
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
    SelectColorModal,
    SelectLocationModal,
    AboutPage,
    StockIncreaseModal,
    StockDecreaseModal,
    Brands,
    BrandDetails,
    DeployPage,
    Roster,
    Roles,
    RoleDetails,
    Suppliers,
    SupplierDetails,
    Orders,
    OrderDetails,
    AddSupplierAndStore,
    CreateSupplier,
    ProductsSelector,
    Closures,
    DeleteAccount
  ],
  providers: [
    IonicErrorHandler,
    { provide: ErrorHandler, useClass: AppErrorHandler },
    StatusBar,
    SplashScreen,
    Network,
    PinDialog,
    Dialogs,
    Insomnia,
    InAppBrowser,
    File,
    Camera,
    FileTransfer,
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
    HelperService,
    ModuleService,
    ClosureService,
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
    StoreEvaluationProvider,
    DaysOfWeekEvaluationProvider,
    AppService,
    Utilities,
    PrintService,
    BrandService,
    StoreService,
    SalesServices,
    ShiftService,
    ClickStopPropagation,
    KeysPipe,
    GroupByPipe,
    LocalDatePipe,
    TranslateService,
    TranslatorPipe,
    authProvider,
    PlatformService,
    AccountSettingService,
    RoleService,
    SupplierService,
    OrderService,
    ResourceService,
    PaymentService,
    AuditService,
    EmailService,
    DeployService,
    SyncContext,
    DeleteAccountService
  ]
})
export class AppModule {
  constructor(public syncContext: SyncContext, injector: Injector) {
    ServiceLocator.injector = injector;
  }
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/language/', '.json');
}

