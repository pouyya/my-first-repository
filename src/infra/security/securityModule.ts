import { SecurityResult, SecurityResultReason } from './model/securityResult';
import { AccessRightItem } from './../../model/accessItemRight';
import { ServiceLocator } from "../../services/serviceLocator";
import { SecurityService } from "../../services/securityService";
import { ToastController } from "ionic-angular";

export function SecurityModule(...accessRights: AccessRightItem[]): Function {
	return function (target: Function): any {

		Object.defineProperty(target.prototype, "PageAccessRightItems", {
			get: function () {
				return accessRights;
			},
			enumerable: false,
			configurable: false
		});

		target.prototype.ionViewCanEnter = async function (): Promise<boolean> {

			let securityService = ServiceLocator.injector.get<SecurityService>(SecurityService);
			let toastController = ServiceLocator.injector.get<ToastController>(ToastController);

			let securityResult: SecurityResult = await securityService.canAccess(<AccessRightItem[]>target.prototype.PageAccessRightItems);
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