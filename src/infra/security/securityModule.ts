import { SecurityResult, SecurityResultReason } from './model/securityResult';
import { AccessRightItem } from './../../model/accessItemRight';
import { ServiceLocator } from "../../services/serviceLocator";
import { SecurityService } from "../../services/securityService";
import { ToastController } from "ionic-angular";

export function SecurityModule(accessRights?: AccessRightItem, persistsCurrentEmployee: boolean = true): Function {
	return function (target: Function): any {
		Object.defineProperty(target.prototype, "PageAccessRightItems", {
			get: function () {
				return accessRights ? [accessRights] : [];
			},
			enumerable: false,
			configurable: false
		});

		target.prototype.baseIonViewCanEnter = target.prototype.ionViewCanEnter;

		target.prototype.ionViewCanEnter = async function (): Promise<boolean> {

			if (target.prototype.baseIonViewCanEnter) {
				if (!await target.prototype.baseIonViewCanEnter.bind(this)()) {
					return false;
				}
			}

			let securityService = ServiceLocator.injector.get<SecurityService>(SecurityService);
			let toastController = ServiceLocator.injector.get<ToastController>(ToastController);

			let securityResult: SecurityResult = await securityService.canAccess(<AccessRightItem[]>target.prototype["PageAccessRightItems"],
				persistsCurrentEmployee);
			if (securityResult.isValid) {
				return true;
			}

			let message: string;
			switch (securityResult.reason) {
				case SecurityResultReason.notEnoughAccess:
					message = 'You do not have enough access rights!';
					break;
				case SecurityResultReason.wrongPIN:
					message = 'Incorrect PIN!';
					break;
				case SecurityResultReason.employeeNotActive:
					message = 'Employee not Active';
					break;
			}

			let toast = toastController.create({
				message,
				duration: 3000
			});
			toast.present();
			return false;
		};
		return target;
	};
}