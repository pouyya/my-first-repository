import { BackOfficeModule } from './../modules/backOfficeModule';
import { Injectable } from "@angular/core";
import { ModuleBase } from "../modules/moduelBase";

@Injectable()
export class ModuleService {
    
    defaultModule: BackOfficeModule;

  constructor() {

      this.defaultModule = new BackOfficeModule();
  }

    public getCurrentModule(currentPage: any = null) : ModuleBase {
        if(currentPage && currentPage.component &&  currentPage.component.prototype && currentPage.component.prototype.Module) {
            return currentPage.component.prototype.Module;
        }
        else {
            return this.defaultModule;
        }        
    }
}