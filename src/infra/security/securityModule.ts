import { AccessItemRight } from './../../model/accessItemRight';
import { ServiceLocator } from "../../services/serviceLocator";
import { SecurityService } from "../../services/securityService";
import { ToastController } from "ionic-angular";

export function SecurityModule(...accessRights: AccessItemRight[]): Function {
	return function (target: Function): any {

		Object.defineProperty(target.prototype, "PageAccessRightItems", {
			get: function () {
				return accessRights;
			},
			enumerable: false,
			configurable: false
		});

		target.prototype.ionViewCanEnter = async function () {

			let securityService = ServiceLocator.injector.get<SecurityService>(SecurityService);
			let toastController = ServiceLocator.injector.get<ToastController>(ToastController);

			if (!await securityService.userHasAccess(target.prototype.PageAccessRightItems)) {
				let toast = toastController.create({
					message: 'You do not have enough permission',
					duration: 3000
				});
				toast.present();
				return false;
			}
			return false;
		};
		return target;
	};
}