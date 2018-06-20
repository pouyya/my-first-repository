import { Injectable } from "@angular/core";
import { ConfigService } from "../modules/dataSync/services/configService";
import { DataSync } from "../modules/dataSync/pages/dataSync/dataSync";
import { LoginPage } from "../modules/dataSync/pages/login/login";
import { PlatformService } from "./platformService";
import { UserService } from "../modules/dataSync/services/userService";

@Injectable()
export class DeployService {

    constructor(
        private platformService: PlatformService,
        private userService: UserService
    ) {

    }

    public eligibleForDeploy() {
        return this.platformService.isMobileDevice() && !ConfigService.isDevelopment() && ConfigService.turnOnDeployment();
    }

    public async getNextPageAfterDeploy() {
        return (await this.userService.isUserLoggedIn()) ? DataSync : LoginPage;
    }
}