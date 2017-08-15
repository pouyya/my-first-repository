export interface PageSettingsInterface {
	title: string,
	icon: string,
	component: any,
	pushNavigation?: boolean
}

export interface ModuleBase {
	pages: Array<PageSettingsInterface>;
}