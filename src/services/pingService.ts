import { Injectable } from "@angular/core";
import { Pro } from "@ionic/pro";
import { DateTimeService } from "./dateTimeService";
import { SyncContext } from "./SyncContext";
import { Platform, NavController } from "ionic-angular";
import { ENV } from "@app/env";
import { UserService } from "../modules/dataSync/services/userService";
import { ConfigService } from "../modules/dataSync/services/configService";
import { Http, Response, Headers } from '@angular/http';

@Injectable()
export class PingService {
    private timer;
    private proDeployVersion;
    private currentStore;
    private currentPos;
    private navCtrl: NavController;

    constructor(private http: Http, private dateTimeService: DateTimeService,
        private syncContext: SyncContext, private platform: Platform,
        private userService: UserService, ) {
    }

    public async init(navCtrl: NavController) {
        this.proDeployVersion = await Pro.deploy.getCurrentVersion();
        this.currentStore = this.syncContext.currentStore._id;
        this.currentPos = this.syncContext.currentPos.id;
        this.navCtrl = navCtrl;
        this.start();
    }

    private start() {
        if (!ENV.pingInterval) {
            return
        }
        this.timer = setInterval(async () => {
            const utcDateTime = this.dateTimeService.getUTCDateString();
            const localDateTime = this.dateTimeService.getLocalDateString();
            const user = await this.userService.getUser();
            const currentPage = this.navCtrl && this.navCtrl.getActive() && this.navCtrl.getActive().instance;

            let data = {
                proDeployVersion: this.proDeployVersion,
                user: user,
                currentStore: this.currentStore,
                currentPos: this.currentPos,
                route: {
                    currentPageName: currentPage && currentPage.constructor.name,
                    module: currentPage && currentPage.Module && currentPage.Module.constructor.name && currentPage.Module.constructor.name
                },
                utcDateTime,
                localDateTime,
                platform: {
                    versions: this.platform.version(),
                    platforms: this.platform.platforms(),
                    width: this.platform.width(),
                    height: this.platform.height(),
                    isLandscape: this.platform.isLandscape(),
                    isPortrait: this.platform.isPortrait(),
                }
            };

            const headers = new Headers({ 'Content-Type': 'application/json' });
            const response = await this.http
                .post(ConfigService.statusEndPoint(), data, { headers })
                .map((response: Response) => response.json());

            response.subscribe((response: any) => {
                if (response === "Success") {
                    console.log("Success");
                }
            },
                err => {
                    console.log(err);
                });
        }, ENV.pingInterval);
    }

    public stop() {
        this.timer && clearInterval(this.timer);
    }

}
