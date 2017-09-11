import { BackOfficeModule } from './../modules/backOfficeModule';
import { Injectable, Injector } from "@angular/core";
import { ModuleBase } from "../modules/moduelBase";

@Injectable()
export class ModuleService {
    
    defaultModule: BackOfficeModule;

  constructor(private injector: Injector) {

      this.defaultModule = new BackOfficeModule();
  }

    public getCurrentModule(currentPage: any = null) : ModuleBase {
        if(currentPage && currentPage.component &&  currentPage.component.prototype && currentPage.component.prototype.Module) {
            currentPage.component.prototype.Module.setInjector(this.injector)
            return currentPage.component.prototype.Module;
        }
        else {
            return this.defaultModule;
        }
    }
}