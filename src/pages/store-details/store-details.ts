import _ from 'lodash';
import { Employee } from './../../model/employee';
import { EmployeeService } from './../../services/employeeService';
import { Component } from '@angular/core';
import {
	AlertController,
	LoadingController,
	ModalController,
	NavController,
	NavParams,
	ToastController
} from 'ionic-angular';
import { StoreService } from '../../services/storeService';
import { Store, POS, Device, DeviceType } from './../../model/store';
import { ResourceService } from '../../services/resourceService';
import { SecurityModule } from '../../infra/security/securityModule';
import { SecurityAccessRightRepo } from './../../model/securityAccessRightRepo';
import { DeviceDetailsModal } from './modals/device-details';
import { PosDetailsModal } from './modals/pos-details';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Utilities } from '../../utility/index';
import { SyncContext } from '../../services/SyncContext';
import * as moment from 'moment-timezone';

@SecurityModule(SecurityAccessRightRepo.StoreAddEdit)
@Component({
	templateUrl: 'store-details.html'
})
export class StoreDetailsPage {
	public item: Store = new Store();
	public isNew: boolean = true;
	public action: string = 'Add';
	public devices: Device[] = [];
	public countries: Array<any> = [];
	public states: Array<any> = [];
	public timezones: Array<{ code: string; name: string }> = [];
	public deviceType = DeviceType;
	private storeForm: FormGroup;
	private fields = [
		'name',
		'orderNumPrefix',
		'orderNum',
		'supplierReturnPrefix',
		'supplierReturnNum',
		'printReceiptAtEndOfSale',
		'taxFileNumber',
		'street',
		'suburb',
		'city',
		'postCode',
		'state',
		'country',
		'timezone',
		'email',
		'phone',
		'twitter',
		'facebook',
		'instagram',
		'receiptHeaderMessage',
		'receiptFooterMessage'
	];
	
	constructor(
		private navCtrl: NavController,
		private navParams: NavParams,
		private modalCtrl: ModalController,
		private syncContext: SyncContext,
		private storeService: StoreService,
		private employeeService: EmployeeService,
		private loading: LoadingController,
		private toastCtrl: ToastController,
		private alertCtrl: AlertController,
		private resourceService: ResourceService,
		private formBuilder: FormBuilder,
		private utils: Utilities
	) {
		this.createForm();
	}

	async ionViewDidEnter() {
		let loader = this.loading.create({
			content: 'Loading Store...'
		});
		let store = this.navParams.get('store');
		if (store) {
			this.item = store;
			this.isNew = false;
			this.action = 'Edit';
		}
		this.timezones = moment.tz.names().map((timezone) => {
			return <{ code: string; name: string }>{
				code: timezone,
				name: timezone
			};
		});
		this.item.timezone && (this.item.timezone = <any>{ code: this.item.timezone, value: this.item.timezone });

		await loader.present();

		this.countries = await this.resourceService.getCountries();
		this.item.country && (this.item.country = <any>{ code: this.item.country, value: this.item.country });

		await loader.dismiss();
	}
async	onCountrySelect(event: {
       value:any
    }) {
		this.states=await this.resourceService.getStates(event.value.code);
		this.item.state=null;
    }
	private createForm() {
		const store = this.navParams.get('store') || {};
		const groupValidation = this.utils.createGroupValidation('Store', this.fields, store);
		this.storeForm = this.formBuilder.group(groupValidation);
	}

	public async onSubmitAndReturn(isReturn) {
		let loader = this.loading.create({ content: 'Saving store...' });
		if (!this.item.POS || this.item.POS.length === 0) {
			const toast = this.toastCtrl.create({
				message: 'Current POS cannot be removed',
				duration: 3000
			});
			toast.present();
			return;
		}

		this.utils.setFormFields(this.storeForm, this.fields, this.item);
		this.item.timezone = this.item.timezone?(this.item.timezone as any).code:"";
		this.item.country = this.item.country?(this.item.country as any).code:"";
		await loader.present();
		if (this.isNew) {
			await this.storeService.add(this.item);
		} else {
			await this.storeService.update(this.item);
		}

		this.item.timezone && (this.item.timezone = <any>{ code: this.item.timezone, value: this.item.timezone });

		this.item.country && (this.item.country = <any>{ code: this.item.country, value: this.item.country });

		loader.dismiss();

		if (isReturn == true) {
			this.navCtrl.pop();
		}
	}

	public showPos(pos: POS, index: number) {
		const newPos = _.clone(pos);
		let modal = this.modalCtrl.create(PosDetailsModal, { pos: newPos });
		modal.onDidDismiss((data: { status: string; pos: POS }) => {
			if (data) {
				if (data.status == 'remove') {
					this.item.POS.splice(index, 1);
				} else {
					this.item.POS[index] = data.pos;
				}
			}
		});
		modal.present();
	}

	public addRegister() {
		let modal = this.modalCtrl.create(PosDetailsModal);
		modal.onDidDismiss((data: { status: string; pos: POS }) => {
			if (data && data.status === 'add') {
				!this.item.POS && (this.item.POS = []);
				this.item.POS.push(data.pos);
			}
		});
		modal.present();
	}

	public async removeAddedRegister(index: number) {
		const deleteItem = await this.utils.confirmRemoveItem('Do you really want to delete this register!');
		if (!deleteItem) {
			return;
		}
		const register = this.item.POS[index];
		if (this.syncContext.currentPos.id === register.id) {
			const toast = this.toastCtrl.create({
				message: 'Current POS cannot be removed',
				duration: 3000
			});
			toast.present();
			return;
		}
		this.item.POS.splice(index, 1);
	}

	// Device
	public showDevice(device: Device, index: number) {
		let modal = this.modalCtrl.create(DeviceDetailsModal, { device });
		modal.onDidDismiss((data: { status: string; device: Device }) => {
			if (data && data.status == 'remove') {
				this.item.devices.splice(index, 1);
			}
		});
		modal.present();
	}

	public addDevice() {
		let modal = this.modalCtrl.create(DeviceDetailsModal);
		modal.onDidDismiss((data: { status: string; device: Device }) => {
			if (data && data.status === 'add') {
				!this.item.devices && (this.item.devices = []);
				this.item.devices.push(data.device);
			}
		});
		modal.present();
	}

	public async removeDevice(index: number) {
		const deleteItem = await this.utils.confirmRemoveItem('Do you really want to delete this device!');
		if (!deleteItem) {
			return;
		}
		let loader = this.loading.create({
			content: 'Deleting. Please Wait!'
		});

		await loader.present();
		this.item.devices.splice(index, 1);
		let toast = this.toastCtrl.create({
			message: 'Device has been deleted successfully',
			duration: 3000
		});
		toast.present();
		loader.dismiss();
	}

	public remove() {
		if (this.item._id === this.syncContext.currentStore._id) {
			const toast = this.toastCtrl.create({
				message: 'Current store cant be delete. Consider to change current store in pos and at least one store should exists.',
				duration: 5000
			});
			toast.present();
			return;
		}

		let confirm = this.alertCtrl.create({
			title: 'Are you sure you want to delete this store ?',
			message: 'Deleting this store, will delete all associated Registers, Sales and any Current Sale!',
			buttons: [
				{
					text: 'Yes',
					handler: () => {
						let loader = this.loading.create({
							content: 'Deleting. Please Wait!'
						});

						loader.present().then(() => {
							this.storeService
								.delete(this.item, true /* Delete all Associations */)
								.then(() => {
									// delete employee associations
									this.employeeService
										.findByStore(this.item._id)
										.then((employees: Employee[]) => {
											if (employees.length > 0) {
												employees.forEach((employee, index, arr) => {
													let storeIndex: number = _.findIndex(
														employee.store,
														(currentStore) => currentStore.id == this.item._id
													);
													arr[index].store.splice(storeIndex, 1);
												});
												this.employeeService
													.updateBulk(employees)
													.then(() => {
														let toast = this.toastCtrl.create({
															message: 'Store has been deleted successfully',
															duration: 3000
														});
														toast.present();
														this.navCtrl.pop();
													})
													.catch((error) => {
														throw new Error(error);
													});
											} else {
												let toast = this.toastCtrl.create({
													message: 'Store has been deleted successfully',
													duration: 3000
												});
												toast.present();
												this.navCtrl.pop();
											}
										})
										.catch((error) => {
											throw new Error(error);
										});
								})
								.catch((error) => {
									let errorMsg = error.hasOwnProperty('error_msg')
										? error.error_msg
										: 'Error while deleting store. Please try again!';
									let alert = this.alertCtrl.create({
										title: 'Error',
										subTitle: errorMsg,
										buttons: [ 'OK' ]
									});
									alert.present();
								})
								.then(() => loader.dismiss());
						});
					}
				},
				'No'
			]
		});

		confirm.present();
	}
}
