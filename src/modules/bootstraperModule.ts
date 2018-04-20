import { ModuleBase, ModalPageInterface, PageSettingsInterface } from "./moduelBase";
import { Injector } from "@angular/core";
import { LogOut } from "./dataSync/pages/logout/logout";

export class BoostraperModule implements ModuleBase {

    public pages: Array<PageSettingsInterface | ModalPageInterface> = [
        { title: 'Logout', icon: 'log-out', component: LogOut }];

    public pinTheMenu: boolean = false;

    setInjector(injector: Injector): void {
    }
}