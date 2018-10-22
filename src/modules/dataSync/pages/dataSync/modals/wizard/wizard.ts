import { ViewController, NavController, AlertController, Events, LoadingController } from 'ionic-angular';
import { Component } from '@angular/core';
import { BusinessService, DBType } from '../../../../../../services/businessService';
import { Business } from '../../../../../../model/business';
import { DBService } from '@simplepos/core/dist/services/dBService';
import { UserService } from '../../../../../../modules/dataSync/services/userService';
import { TypeHelper } from '@simplepos/core/dist/utility/typeHelper';
import { DB } from '@simplepos/core/dist/db/db';
import moment from 'moment';
import { ResourceService } from '../../../../../../services/resourceService';

@Component({
    selector: "wizard",
    templateUrl: "wizard.html",
    styles: [`
        .wizard-info{
            padding: 25px;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
        }
    `, `        
        .list-padding{
            padding-bottom: 70px;
        }
    `]
})
export class Wizard {

    public firstName: string = "";
    public lastName: string = "";
    public storeName: string = "";
    public taxFileNumber: string = "";
    public phone: string = "";
    public address: string = "";
    public city: string = "";
    public postCode: string = "";
    public state: string = "";
    public country: string = "";
    public adminPin: string = "";

    public facebook: string = "";
    public twitter: string = "";
    public instagram: string = "";

    public businesses: Array<Business>;
    public selectedBusiness: Business;

    step: any;
    stepCondition: any;
    currentStep: any;

    public timeZones: Array<{ code: string, name: string }> = [];
    public timeZone: string = "";

    public countries: Array<{ code: string, name: string }> = [];

    constructor(public navCtrl: NavController, public viewCtrl: ViewController,
        public alertCtrl: AlertController, public events: Events,
        private loading: LoadingController, private businessService: BusinessService,
        private userService: UserService, private resourceService: ResourceService) {
        this.step = 1;
        this.currentStep = this.step;
        this.stepCondition = true;
        this.events.subscribe('step:changed', step => {
            this.currentStep = step;
            this.onFieldChanged();
        });
    }

    async ionViewDidEnter() {
        let loader = this.loading.create({
            content: 'Loading...'
        });

        this.businesses = this.businessService.getAll();
        this.timeZones = moment.tz.names().map(timezone => {
            return <{ code: string, name: string }>{
                code: timezone,
                name: timezone
            }
        });
        this.countries = await this.resourceService.getCountries();

        await loader.dismiss();
    }

    public async onFinish() {

        var criticalDb = await this.businessService.getDataTemplate(this.selectedBusiness, DBType.Critical);

        criticalDb = criticalDb
            .replace("{FirstName}", this.firstName)
            .replace("{LastName}", this.lastName)
            .replace("{StoreName}", this.storeName)
            .replace("{TaxFileNumber}", this.taxFileNumber)
            .replace("{EmailAddress}", this.userService.getEmail())
            .replace("{Phone}", this.phone)
            .replace("{Address}", this.address)
            .replace("{City}", this.city)
            .replace("{PostCode}", this.postCode)
            .replace("{StateName}", this.state)
            .replace("{TimeZone}", this.timeZone)
            .replace("{Country}", this.country)
            .replace("{BusinessType}", this.selectedBusiness.id)
            .replace("{AdminPin}", this.adminPin)
            .replace("{Twitter}", this.twitter)
            .replace("{Facebook}", this.facebook)
            .replace("{Instagram}", this.instagram);

        this.bulkDocs(DBService.pouchDBProvider.criticalDB, criticalDb);
        this.bulkDocs(DBService.pouchDBProvider.currentDB, await this.businessService.getDataTemplate(this.selectedBusiness, DBType.Current));
        this.bulkDocs(DBService.pouchDBProvider.auditDB, await this.businessService.getDataTemplate(this.selectedBusiness, DBType.Audit));

        this.viewCtrl.dismiss({
            status: true
        });
    }

    async bulkDocs(db: DB, dbContent: string) {
        if (!TypeHelper.isNullOrWhitespace(dbContent)) {
            var dbDocs = JSON.parse(dbContent);
            return await db.bulkDocs(dbDocs.docs);
        }
    }

    public onFieldChanged() {
        if (this.currentStep === 1 && (this.firstName == "" || this.lastName == "")) {
            this.stepCondition = false;
        }
        else if (this.currentStep === 2 && (this.storeName == "" || !this.selectedBusiness || this.taxFileNumber == "" || this.phone == "" || this.address == "" || this.adminPin == "" || this.timeZone)) {
            this.stepCondition = false;
        } else {
            this.stepCondition = true
        }
    }

    public dismiss() {
        const alert = this.alertCtrl.create({
            title: 'Dear user please provide information to be able to proceed to next step.',
            buttons: ['OK']
        });
        alert.present();
    }
}