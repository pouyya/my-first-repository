import { Component, NgZone } from "@angular/core";
import { Supplier } from "../../model/supplier";
import { SupplierService } from "../../services/supplierService";
import { LoadingController } from "ionic-angular/components/loading/loading-controller";
import { NavController } from "ionic-angular/navigation/nav-controller";
import { SupplierDetails } from "../supplier-details/supplier-details";
import { PageModule } from "../../metadata/pageModule";
import { InventoryModule } from "../../modules/inventoryModule";
import { SecurityModule } from "../../infra/security/securityModule";
import { SecurityAccessRightRepo } from "../../model/securityAccessRightRepo";

interface SupplierList extends Supplier {
	associatedProducts: number;
}

@SecurityModule(SecurityAccessRightRepo.SupplierListing)
@PageModule(() => InventoryModule)
@Component({
	selector: 'suppliers',
	templateUrl: 'suppliers.html'
})
export class Suppliers {

	public suppliers: SupplierList[];
	private readonly defaultLimit = 10;
	private readonly defaultOffset = 0;
	private limit: number;
	private offset: number;
	private filter: string;

	constructor(
		private supplierService: SupplierService,
		private loadingCtrl: LoadingController,
		private navCtrl: NavController,
		private zone: NgZone
	) {
		this.suppliers = [];
	}

	async ionViewDidEnter() {
		this.limit = this.defaultLimit;
		this.offset = this.defaultOffset;
		this.suppliers = [];
		let loader = this.loadingCtrl.create({ content: 'Loading Suppliers' });
		await loader.present();
		await this.fetchMore();
		loader.dismiss();
	}

	public view(supplier?: SupplierList) {
		this.navCtrl.push(SupplierDetails, { supplier: supplier || null });
	}

	public async search(event) {
		let val = event.target.value;
		this.filter = (val && val.trim() != '') ? val : '';
		this.limit = this.defaultLimit;
		this.offset = this.defaultOffset;
		this.suppliers = [];
		await this.fetchMore();
	}

	public async fetchMore(infiniteScroll?: any) {
		let suppliers = await this.loadSuppliers();
		this.offset += suppliers ? suppliers.length : 0;
		this.zone.run(() => {
			this.suppliers = this.suppliers.concat(suppliers);
			infiniteScroll && infiniteScroll.complete();
		});
	}

	private async loadSuppliers(): Promise<SupplierList[]> {
		let options: any = {};
		this.filter && (options['name'] = this.filter);
		return <SupplierList[]>await this.supplierService.search(this.limit, this.offset, options);
	}
}