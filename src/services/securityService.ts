import { LoadingController } from 'ionic-angular';
import { Injectable } from "@angular/core";
import { PluginService } from "./pluginService";
import { EmployeeService } from "./employeeService";
import { PosService } from "./posService";
import { UserService } from "./userService";
import { Employee } from "../model/employee";
import * as _ from "lodash";

@Injectable()
export class SecurityService {

    constructor(
        private pluginService: PluginService,
        private employeeService: EmployeeService,
        private posService: PosService,
        private userService: UserService,
        private loading: LoadingController
    ) { }

    async userHasAccess(roles: string[]): Promise<boolean> {
        let loader = this.loading.create({
          content: 'Please Wait...',
        });
        await loader.present();
        if (roles.length == 0) {
            // that's an insecure module!
            this.employeeService.setEmployee(null); // clear employee from memory
            loader.dismiss();
            return true;
        } else {
            let employee = this.employeeService.getEmployee();
            let currentUserStore = (await this.userService.getUser()).currentStore;
            if (employee) {
                if (this.verifyEmployeeRoles(employee, currentUserStore, roles)) {
                    loader.dismiss();
                    return true;
                } else {
                    loader.dismiss();
                    return this.checkAccessAndSetEmployee(currentUserStore, roles);
                }
            } else {
                loader.dismiss();
                return this.checkAccessAndSetEmployee(currentUserStore, roles);
            }
        }
    };

    private async checkAccessAndSetEmployee(currentUserStore: string, requiredRoles: string[]): Promise<boolean> {
        var model = await this.giveAccessByPin(currentUserStore, requiredRoles);
        if (model) {
            this.employeeService.setEmployee(model);
            return true;
        }
        return false;
    }

    private async giveAccessByPin(currentStoreId, requiredRoles: string[]): Promise<Employee> {
        var pin = await this.pluginService.openPinPrompt(
            'Enter PIN',
            'User Authorization', [],
            { ok: 'OK', cancel: 'Cancel' })

        if (pin) {
            var model = await this.employeeService.findByPin(pin)
            if (this.verifyEmployeeRoles(model, currentStoreId, requiredRoles)) {
                return model;
            }
        }
    }

    private verifyEmployeeRoles(employee: Employee, currentStoreId: string, requiredRoles: string[]): boolean {

        if (employee) {
            if (employee.isAdmin) {
                return true;
            }

            if (employee.store && employee.store.length > 0) {
                let store: any = _.find(employee.store, { id: currentStoreId });
                if (store) {
                    if (store.roles.length > 0) {
                        let roles = _.intersection(requiredRoles, store.roles);
                        if (roles.length === requiredRoles.length) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    };

}
