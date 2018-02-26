import * as _ from "lodash";
import { RoleService } from './roleService';
import { LoadingController } from 'ionic-angular';
import { Injectable } from "@angular/core";
import { PluginService } from "./pluginService";
import { EmployeeService } from "./employeeService";
import { Employee } from "../model/employee";
import { UserService } from './../modules/dataSync/services/userService';
import { AccessRightItem } from '../model/accessItemRight';
import { GuardInterface } from "../model/guardInterface";
import { SecurityResult, SecurityResultReason } from './../infra/security/model/securityResult';

@Injectable()
export class SecurityService implements GuardInterface {

	constructor(
		private pluginService: PluginService,
		private employeeService: EmployeeService,
		private roleService: RoleService,
		private userService: UserService,
		private loading: LoadingController
	) { }

	/**
	 * Check Page Access for Employee
	 * @param accessRightItems 
	 * @returns {Promise<SecurityResult>}
	 */
	public async canAccess<T extends AccessRightItem>(accessRightItems: T[] = [], persistsCurrentEmployee: boolean = true): Promise<SecurityResult> {
		let securityResult: SecurityResult;
		let loader = this.loading.create({ content: 'Please Wait...' });
		await loader.present();

		if (accessRightItems.length === 0) {
			this.employeeService.setEmployee(null);
			securityResult = new SecurityResult(true, SecurityResultReason.accessGrant);
			loader.dismiss();
			return securityResult;
		}

		let employee = this.employeeService.getEmployee();
		let currentUserStore = (await this.userService.getUser()).currentStore;
		if (employee) {
			if (await this.verifyEmployeeAccessRightItems(employee, currentUserStore, accessRightItems)) {
				securityResult = new SecurityResult(true, SecurityResultReason.accessGrant);
				loader.dismiss();
				return securityResult;
			} else {
				loader.dismiss();
				securityResult = await this.verifyPinAndGiveAccess(currentUserStore, accessRightItems, persistsCurrentEmployee);
				return securityResult;
			}
		} else {
			securityResult = await this.verifyPinAndGiveAccess(currentUserStore, accessRightItems, persistsCurrentEmployee);
			loader.dismiss();
			return securityResult;
		}
	}

	/**
	 * Accepts PIN and set employee to give access
	 * @param currentUsersStore 
	 * @param accessRightItems 
	 * @returns {Promise<SecurityResult>}
	 */
	private async verifyPinAndGiveAccess(currentUsersStore: string, accessRightItems: AccessRightItem[], persistsCurrentEmployee: boolean): Promise<SecurityResult> {
		let pin = await this.pluginService.openPinPrompt('Enter PIN', 'User Authorization', [],
			{ ok: 'OK', cancel: 'Cancel' });

		if (!pin) {
			return new SecurityResult(false, SecurityResultReason.notEnoughAccess);
		}

		let model: Employee = await this.employeeService.findByPin(pin);
		if (!model) {
			return new SecurityResult(false, SecurityResultReason.wrongPIN);
		}

		if(!model.isActive && !model.isAdmin) {
			return new SecurityResult(false, SecurityResultReason.employeeNotActive);
		}

		if (!await this.verifyEmployeeAccessRightItems(model, currentUsersStore, accessRightItems)) {
			return new SecurityResult(false, SecurityResultReason.notEnoughAccess);
		}

		if (persistsCurrentEmployee) {
			this.employeeService.setEmployee(model);
		}
		return new SecurityResult(true, SecurityResultReason.accessGrant);
	}

	/**
	 * 
	 * @param employee 
	 * @param currentStoreId 
	 * @param accessRightItems 
	 * @returns {Promise<boolean>}
	 */
	private async verifyEmployeeAccessRightItems(employee: Employee, currentStoreId: string, accessRightItems: AccessRightItem[]): Promise<boolean> {
		if (employee) {
			if (employee.hasOwnProperty('isAdmin') && employee.isAdmin) {
				return true;
			}

			let employeeAssociatedStore = _.find(employee.store, { id: currentStoreId });
			if (employeeAssociatedStore) {
				if (!employeeAssociatedStore.role) {
					return false;
				} else {
					let role = await this.roleService.get(employeeAssociatedStore.role);
					let accessRightItemIds = accessRightItems.map(right => right.id);
					let i = 0;
					let approved: boolean = true;
					while (i < accessRightItemIds.length) {
						if (role.accessRightItems.indexOf(accessRightItemIds[i]) == -1) {
							approved = false;
							break;
						}
						i++;
					}
					return approved;
				}
			}
			return false;
		}

		return false;
	}
}
