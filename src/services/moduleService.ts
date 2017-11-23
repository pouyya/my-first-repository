import { SalesModule } from './../modules/salesModule';
import { Injectable, Injector } from "@angular/core";
import { ModuleBase } from "../modules/moduelBase";

@Injectable()
export class ModuleService {

  defaultModule: SalesModule;

  constructor(private injector: Injector) {

    this.defaultModule = new SalesModule();
  }

  public getCurrentModule(currentPage: any = null): ModuleBase {
    if (currentPage && currentPage.component && currentPage.component.prototype && currentPage.component.prototype.Module) {
      currentPage.component.prototype.Module.setInjector(this.injector);
      return currentPage.component.prototype.Module;
    }
    return this.defaultModule;
  }
}