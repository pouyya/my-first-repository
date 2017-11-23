import { Injector, EventEmitter } from '@angular/core';
export class GlobalInjector extends EventEmitter<any> {

  isInit: boolean = false;
  injector: Injector;

  onInit(): Promise<Injector> {
    return new Promise((resolve) => {
      if (this.isInit)
        return resolve(this.injector);

      this.subscribe((injector) => {
        if (!injector) this.injector = injector;
        resolve(injector);
      });
    })

  }

}

window.globalInjector = new GlobalInjector();