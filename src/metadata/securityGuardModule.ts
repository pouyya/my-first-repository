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
		let userService: UserService;

		window.globalInjector.onInit().then((injector: Injector) => {
			pluginService = injector.get(PluginService);
			employeeService = injector.get(EmployeeService);
			userService = injector.get(UserService);
		});
		const roleModule = <BaseRoleModule>new (roleModuleFunc())();

		const ionViewCanEnter = async () => {
			if (constructor.name !== roleModule.associatedPage) {
				console.error(new Error(`Incorrect ${roleModule.constructor.name} for page ${roleModule.associatedPage}`));
				return Promise.reject("Invalid Page Module!");
			} else {
				try {
					if (roleModule.roles.length == 0) {
						employeeService.setEmployee(null);
						return;
					} else {
						let employee: Employee
						const pinDialogeFunc = pluginService.openPinPrompt.bind(null,
							'Enter PIN',
							'User Authorization', [],
							{ ok: 'OK', cancel: 'Cancel' });
						employee = employeeService.getEmployee();
						if (employee) {
							return verifyEmployeeRoles(employee);
						} else {
							let pin = await pinDialogeFunc();
							employee = await this.employeeService.findByPin(pin);
							if (employee) {
								return verifyEmployeeRoles(employee);

							} else {
								return Promise.reject("Employee not found");
							}
						}
					}
				} catch (err) {
					return Promise.reject(err);
				}
			}

			function verifyEmployeeRoles(employee: Employee) {
				let doorLocks: boolean[] = [];
				let store = employee.store[0]; // TODO: this should be from current store
				store.roles.forEach(role => {
					doorLocks.push(roleModule.roles.indexOf(role) > 0);
				});

				if (doorLocks.every(lock => lock)) {
					return;
				} else {
					return Promise.reject({});
				}
			}
		}

		Object.defineProperty(constructor.prototype, "ionViewCanEnter", {
			value: ionViewCanEnter
		});

	}
}