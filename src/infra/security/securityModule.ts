import { SecurityResult, SecurityResultReason } from './model/securityResult';
import { AccessRightItem } from './../../model/accessItemRight';
import { ServiceLocator } from "../../services/serviceLocator";
import { SecurityService } from "../../services/securityService";
import { ToastController } from "ionic-angular";

export function SecurityModule(accessRights: AccessRightItem, isModal?: boolean, persistsCurrentEmployee: boolean = true): Function {
	return function (target: Function): any {
		const property = isModal && "ModalAccessRightItems" || "PageAccessRightItems";
		Object.defineProperty(target.prototype, property, {
			get: function () {
        return accessRights ? [accessRights] : [];
			},
			enumerable: false,
			configurable: false
		});

		target.prototype.ionViewCanEnter = async function (): Promise<boolean> {

			let securityService = ServiceLocator.injector.get<SecurityService>(SecurityService);
			let toastController = ServiceLocator.injector.get<ToastController>(ToastController);

			let securityResult: SecurityResult = await securityService.canAccess(<AccessRightItem[]>target.prototype[property],
				persistsCurrentEmployee);
			if (securityResult.isValid) {
				return true;
			}

			let message: string;
			switch(securityResult.reason) {
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