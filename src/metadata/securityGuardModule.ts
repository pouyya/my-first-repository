import { Employee } from './../model/employee';
import { EmployeeService } from './../services/employeeService';
import { AlertController } from 'ionic-angular';
import { Dialogs } from '@ionic-native/dialogs';
import { PinDialog } from '@ionic-native/pin-dialog';
import { Platform } from 'ionic-angular';
import { PluginService } from './../services/pluginService';
import { AppModule } from './../app/app.module';
import { BaseRoleModule } from './../modules/roles/baseRoleModule';
import { ReflectiveInjector, Injector, Injectable } from '@angular/core';

/*
var pluginService: any = {};
var injectServices = (injector: Injector) => {
  pluginService = injector.get(PluginService);
}
*/

export function SecurityGuard(roleModuleFunc: Function): Function {
  return function (constructor: any) {

    // const injector = ReflectiveInjector.resolveAndCreate([PluginService, Platform, PinDialog, Dialogs, AlertController]);
    // var pluginService = injector.get(PluginService);
    // console.warn(pluginService);

    const pluginService = AppModule.injector.get(PluginService);
    const employeeService = AppModule.injector.get(EmployeeService);
    const roleModule = <BaseRoleModule>new (roleModuleFunc())();

    const ionViewCanEnter = async (): Promise<any> => {
      if (constructor.prototype.name == roleModule.associatedPage) {
        console.error(new Error(`Incorrect ${roleModule.constructor.name} for page ${roleModule.associatedPage}`));
        return Promise.reject("Invalid Page Module!");
      } else {
        try {
          let openPinDialoge = pluginService.openPinPrompt.bind(null,
            'Enter PIN',
            'User Authorization', [],
            { ok: 'OK', cancel: 'Cancel' });
          let employee: Employee = employeeService.getEmployee();
          
          // TODO: Below will be code for checking against roles and give access or not
          const pin = await pluginService.openPinPrompt('Enter PIN', 'User Authorization', [],
            { ok: 'OK', cancel: 'Cancel' });
          if (pin) {
            return;
          } else {
            return Promise.reject(new Error("Invalid Pin"))
          }
        } catch (err) {
          return Promise.reject(err);
        }
      }
    }

    Object.defineProperty(constructor.prototype, "ionViewCanEnter", {
      value: ionViewCanEnter
    });

  }
}