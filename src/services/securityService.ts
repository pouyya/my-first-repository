import { LoadingController } from 'ionic-angular';
import { Injectable } from "@angular/core";
import { PluginService } from "./pluginService";
import { EmployeeService } from "./employeeService";
import { PosService } from "./posService";
import { UserService } from "./userService";
import { Employee } from "../model/employee";
import * as _ from "lodash";
import { AccessItemRight } from '../model/accessItemRight';

@Injectable()
export class SecurityService {

	constructor(
		private pluginService: PluginService,
		private employeeService: EmployeeService,
		private posService: PosService,
		private userService: UserService,
		private loading: LoadingController
	) { }

	async userHasAccess(accessRightItems: AccessItemRight[]): Promise<boolean> {
		let loader = this.loading.create({
			content: 'Please Wait...',
		});
		await loader.present();
		if (accessRightItems.length == 0) {
			// that's an insecure module!
			this.employeeService.setEmployee(null); // clear employee from memory
			loader.dismiss();
			return true;
		} else {
			let employee = this.employeeService.getEmployee();
			let currentUserStore = (await this.userService.getUser()).currentStore;
			if (employee) {
				if (this.verifyEmployeeAccessRightItems(employee, currentUserStore, accessRightItems)) {
					loader.dismiss();
					return true;
				} else {
					loader.dismiss();
					return this.checkAccessAndSetEmployee(currentUserStore, accessRightItems);
				}
			} else {
				loader.dismiss();
				return this.checkAccessAndSetEmployee(currentUserStore, accessRightItems);
			}
		}
	};

	private async checkAccessAndSetEmployee(currentUserStore: string, accessRightItems: AccessItemRight[]): Promise<boolean> {
		var model = await this.giveAccessByPin(currentUserStore, accessRightItems);
		if (model) {
			this.employeeService.setEmployee(model);
			return true;
		}
		return false;
	}

	private async giveAccessByPin(currentStoreId, accessRightItems: AccessItemRight[]): Promise<Employee> {
		var pin = await this.pluginService.openPinPrompt(
			'Enter PIN',
			'User Authorization', [],
			{ ok: 'OK', cancel: 'Cancel' })

		if (pin) {
			var model = await this.employeeService.findByPin(pin)
			if (this.verifyEmployeeAccessRightItems(model, currentStoreId, accessRightItems)) {
				return model;
			}
		}
	}

	private verifyEmployeeAccessRightItems(employee: Employee, currentStoreId: string, accessRightItems: AccessItemRight[]): boolean {

		if (employee) {

			if (employee.isAdmin) {
				return true;
			}

			let employeeAssociatedStore = _.find(employee.store, { id: currentStoreId });
			return employeeAssociatedStore && _.some(employeeAssociatedStore.roles, accessRightItems.map(right => right.id));
		}

		return false;
	}
}
