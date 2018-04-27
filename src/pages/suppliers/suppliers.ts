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
import { SearchableListing } from "../../modules/searchableListing";

interface SupplierList extends Supplier {
	associatedProducts: number;
}

@SecurityModule(SecurityAccessRightRepo.SupplierListing)
@PageModule(() => InventoryModule)
@Component({
	selector: 'suppliers',
	templateUrl: 'suppliers.html'
})
export class Suppliers extends SearchableListing<Supplier>{

	public items: SupplierList[] = [];

	constructor(
		private supplierService: SupplierService, //used in constructor
		private loadingCtrl: LoadingController,
		private navCtrl: NavController,
		protected zone: NgZone
	) {
		super(supplierService, zone, 'Supplier');
	}

	async ionViewDidEnter() {
        this.setDefaultSettings();
		let loader = this.loadingCtrl.create({ content: 'Loading Suppliers' });
		await loader.present();
		await this.fetchMore();
		loader.dismiss();
	}

	public view(supplier?: SupplierList) {
		this.navCtrl.push(SupplierDetails, { supplier: supplier || null });
	}
}