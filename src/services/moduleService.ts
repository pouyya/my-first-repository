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
    if (currentPage) {
      var currentModule: any;
      if (currentPage.Module) {
        currentModule = currentPage.Module
      }
      else if (currentPage.component && currentPage.component.prototype && currentPage.component.prototype.Module) {
        currentModule = currentPage.component.prototype.Module;
      }

      if (currentModule) {
        currentModule.setInjector(this.injector);
        return currentModule;
      }
    }
    return this.defaultModule;
  }
}