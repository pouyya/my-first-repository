import { Injector } from '@angular/core';

export interface PageSettingsInterface {
	title: string;
	icon: string;
	component: any;
	pushNavigation?: boolean;
	disabled?: boolean;
	canHidden?: boolean;
}

export interface ModalPageInterface extends PageSettingsInterface {
	modal: boolean;
	onDismiss(data: any);
}

export interface ModuleBase {
	pages: Array<PageSettingsInterface | ModalPageInterface>;
	pinTheMenu: boolean;
	setInjector($injector: Injector): void;
}