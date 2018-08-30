import { StoreService } from './../../services/storeService';
import { Component, NgZone } from '@angular/core';
import { AlertController, NavController, Platform, ToastController, ModalController } from 'ionic-angular';
import { StoreDetailsPage } from "../store-details/store-details";
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from '../../model/securityAccessRightRepo';
import { SearchableListing } from "../../modules/searchableListing";
import { Store } from "../../model/store";
import _ from "lodash";
import { Employee } from "../../model/employee";
import { SyncContext } from "../../services/SyncContext";
import { EmployeeService } from "../../services/employeeService";
import { Utilities } from "../../utility";
import { CreateStoreModal } from '../store-details/modals/create-store/create-store';

@SecurityModule(SecurityAccessRightRepo.StoreListing)
@PageModule(() => BackOfficeModule)
@Component({
    templateUrl: 'stores.html'
})
export class Stores extends SearchableListing<Store>{

    public items: Store[] = [];

    constructor(public navCtrl: NavController,
        private storeService: StoreService,
        private platform: Platform,
        protected zone: NgZone,
        private syncContext: SyncContext,
        private toastCtrl: ToastController,
        private alertCtrl: AlertController,
        private employeeService: EmployeeService,
        private modalCtrl: ModalController,
        private utility: Utilities
    ) {
        super(storeService, zone, 'Store');
    }

    async ionViewDidEnter() {
        await this.platform.ready();
        await this.fetch();
    }

    public createStore() {
        let modal = this.modalCtrl.create(CreateStoreModal);
        modal.onDidDismiss(data => {
            if (data && data.status) {
                this.showDetail(data.store);
            }
        });
        modal.present();
    }

    showDetail(store) {
        this.navCtrl.push(StoreDetailsPage, { store });
    }

    public async remove(store: Store, index: number) {
        if (store._id === this.syncContext.currentStore._id) {
            const toast = this.toastCtrl.create({
                message: 'Current store cant be delete. Consider to change current store in pos and at least one store should exists.',
                duration: 5000
            });
            toast.present();
            return;
        }
        try {
            const deleteItem = await this.utility.confirmRemoveItem("Do you really want to delete this store!");
            if (!deleteItem) {
                return;
            }
            await this.storeService.delete(store, true /* Delete all Associations */);
            const employees: Employee[] = await this.employeeService.findByStore(store._id);
            if (employees.length > 0) {
                employees.forEach((employee, employeeIndex, arr) => {
                    let storeIndex: number = _.findIndex(employee.store, (currentStore) => currentStore.id == store._id);
                    arr[employeeIndex].store.splice(storeIndex, 1);
                });
                await this.employeeService.updateBulk(employees);
            }
            this.items.splice(index, 1);
            let toast = this.toastCtrl.create({
                message: 'Store has been deleted successfully',
                duration: 3000
            });
            toast.present();
        } catch (error) {
            let errorMsg = error.hasOwnProperty('error_msg') ? error.error_msg : 'Error while deleting store. Please try again!';
            let alert = this.alertCtrl.create({
                title: 'Error',
                subTitle: errorMsg,
                buttons: ['OK']
            });
            alert.present();
        }

    }

}