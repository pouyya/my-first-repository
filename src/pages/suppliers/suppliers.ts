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
import {Utilities} from "../../utility";

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
		supplierService: SupplierService,
		private loadingCtrl: LoadingController,
		private navCtrl: NavController,
		protected zone: NgZone,
		private utility: Utilities
	) {
		super(supplierService, zone, 'Supplier');
	}

	async ionViewDidEnter() {
        this.setDefaultSettings();
		let loader = this.loadingCtrl.create({ content: 'Loading Suppliers' });
		await loader.present();
		await this.fetch();
		loader.dismiss();
	}

	public view(supplier?: SupplierList) {
		this.navCtrl.push(SupplierDetails, { supplier: supplier || null });
	}

    public async remove(supplier: Supplier, index: number) {
		const deleteItem = await this.utility.confirmRemoveItem("Do you wish to delete this supplier!");
		if(!deleteItem){
			return;
		}
		await super.remove(supplier, index);
    }
}