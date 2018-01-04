import { ServiceLocator } from "../../services/serviceLocator";
import { SecurityService } from "../../services/securityService";
import { ToastController } from "ionic-angular";

export function SecurityModule(accessRights: string | string[]): Function {
    return function (target: Function): any {

        Object.defineProperty(target.prototype, "AccessRightItems", {
            get: function () {
                return Array.isArray(accessRights) ? accessRights : [accessRights];
            },
            enumerable: false,
            configurable: false
        });

        target.prototype.ionViewCanEnter = async function () {

            var securityService = ServiceLocator.injector.get<SecurityService>(SecurityService);
            var toastController = ServiceLocator.injector.get<ToastController>(ToastController);

            if (!await securityService.userHasAccess(["asdasd"])) {
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