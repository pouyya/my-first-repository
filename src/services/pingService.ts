import { Injectable } from "@angular/core";
import { AuthService } from "../modules/dataSync/services/authService";
import { Pro } from "@ionic/pro";
import { DateTimeService } from "./dateTimeService";
import { SyncContext } from "./SyncContext";
import { Platform } from "ionic-angular";
import { ENV } from "@app/env";
import { UserService } from "../modules/dataSync/services/userService";

@Injectable()
export class PingService {
    private timer;
    private proDeployVersion;
    private currentStore;
    private currentPos;
    constructor(private authService: AuthService, private dateTimeService: DateTimeService,
        private syncContext: SyncContext, private platform: Platform,
        private userService: UserService) {
    }

    public async init() {
        this.proDeployVersion = await Pro.deploy.getCurrentVersion();
        this.currentStore = this.syncContext.currentStore._id;
        this.currentPos = this.syncContext.currentPos.id;
        this.start();
    }

    private start() {
        if (!ENV.pingInterval) {
            return
        }
        this.timer = setInterval(async () => {
            const utcDateTime = this.dateTimeService.getCurrentUTCDate().toString();
            const localDateTime = this.dateTimeService.getCurrentLocalDate().toString();
            const email = await this.userService.getUserEmail();
            const currentPage = this.platform.url();
            const response = await this.authService.ping(this.proDeployVersion, email, this.currentStore, this.currentPos, currentPage, utcDateTime, localDateTime);
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
