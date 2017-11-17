import _ from 'lodash';
import { PosService } from './../services/posService';
import { UserService } from './../services/userService';
import { Employee } from './../model/employee';
import { EmployeeService } from './../services/employeeService';
import { PluginService } from './../services/pluginService';
import { BaseRoleModule } from './../modules/roles/baseRoleModule';
import { Injector } from '@angular/core';

export function SecurityGuard(roleModuleFunc: Function): Function {
  return function (constructor: any) {
    let pluginService: PluginService;
    let employeeService: EmployeeService;
    let posService: PosService;
    let userService: UserService;

    window.globalInjector.onInit().then((injector: Injector) => {
      pluginService = injector.get(PluginService);
      employeeService = injector.get(EmployeeService);
      posService = injector.get(PosService);
      userService = injector.get(UserService);
    });
    const roleModule = <BaseRoleModule>new (roleModuleFunc())();

    const verifyEmployeeRoles = (employee: Employee, currentStoreId: string): boolean => {
      let authorized: boolean = false;
      if (employee.store.length > 0) {
        let store: any = _.find(employee.store, { id: currentStoreId });
        if (store) {
          if (store.roles.length > 0) {
            let roles = _.intersection(roleModule.roles, store.roles);
            if (roles.length === roleModule.roles.length) {
              authorized = true;
            }
          }
        }
      }
      return authorized;
    };

    const giveAccessByPin = (currentStoreId): Promise<Employee> => {
      return new Promise((resolve, reject) => {
        pluginService.openPinPrompt(
          'Enter PIN',
          'User Authorization', [],
          { ok: 'OK', cancel: 'Cancel' }).then(pin => {
          if (pin) {
            employeeService.findByPin(pin).then((model: Employee) => {
              verifyEmployeeRoles(model, currentStoreId) ? resolve(model) : reject("Unauthorized!");
            }).catch(err => reject(err));
          } else {
            reject("Cancelled");
          }
        }).catch(err => reject(err));
      });
    };

    const ionViewCanEnter = (): Promise<any> => {
      return new Promise((resolve, reject) => {
        if (constructor.name !== roleModule.associatedPage) {
          console.error(new Error(`Incorrect ${roleModule.constructor.name} for page ${roleModule.associatedPage}`));
          reject("Invalid Page Module!");
        } else {
          if (roleModule.roles.length == 0) {
            // that's an insecure module!
            employeeService.setEmployee(null); // clear employee from memory
            resolve();
          } else {
            let employee: Employee = employeeService.getEmployee();
            let user = userService.getLoggedInUser();
            if (employee) {
              if (verifyEmployeeRoles(employee, user.currentStore)) {
                resolve();
              } else {
                giveAccessByPin(user.currentStore).then((model: Employee) => {
                  employeeService.setEmployee(model);
                  resolve();
                }).catch(err => reject(err));
              }
            } else {
              giveAccessByPin(user.currentStore).then((model: Employee) => {
                employeeService.setEmployee(model);
                resolve();
              }).catch(err => reject(err));
            }
          }
        }
      });
    };


    Object.defineProperty(constructor.prototype, "ionViewCanEnter", {
      value: ionViewCanEnter
    });

  }
}