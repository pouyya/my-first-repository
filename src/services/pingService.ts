import { Injectable } from "@angular/core";
import { AuthService } from "../modules/dataSync/services/authService";
import {Pro} from "@ionic/pro";
import {DateTimeService} from "./dateTimeService";
import {SyncContext} from "./SyncContext";
import {Platform} from "ionic-angular";
import {ENV} from "@app/env";

@Injectable()
export class PingService {
  private timer;
  private proDeployVersion;
  private currentStore;
  private currentPos;
  constructor(private authService: AuthService, private dateTimeService: DateTimeService,
              private syncContext: SyncContext, private platform: Platform) {
  }

  public async init(){
      this.proDeployVersion = await Pro.deploy.getCurrentVersion();
      this.currentStore = this.syncContext.currentStore._id;
      this.currentPos = this.syncContext.currentPos.id;
      this.start();
  }

  private start(){
    this.timer = setInterval(async () => {
        const time = this.dateTimeService.getCurrentUTCDate().toString();
        const path: string[] = this.platform.url().split('/');
        const currentPage = path[0];
        const response = await this.authService.ping(this.proDeployVersion, this.currentStore, this.currentPos, currentPage, time);
        response.subscribe(response => {
                if (response.length > 0) {
                    console.log("Success");
                }
            },
            err => {
                console.log(err);
            });
    }, ENV.pingInterval);
  }

  public stop(){
    this.timer && clearInterval(this.timer);
  }

}
