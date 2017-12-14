import { Injectable } from "@angular/core";
import { ConfigService } from "./configService";
declare var IonicCordova;

@Injectable()
export class DeployService {
  deploy() {
    this.update(ConfigService.ionicDeployAppId(), ConfigService.ionicDeployAppChannel());
  }

  async update(appId: string, channelName: string) {
    // Set our app data (OPTIONAL)
    let config = {
      appId: appId,
      channel: channelName
    }

    return new Promise((resolve) => {

      // Initialize the deploy plugin (OPTIONAL)
      IonicCordova.deploy.init(config, (res: any) => {
        console.log(res)
      }, (err: any) => {
        this.handleError(err, resolve)
      })

      // Check for available updates
      IonicCordova.deploy.check((res: any) => {
        console.log("Check result:", res)

        if (res === 'true') {

          // A new version is ready to download
          IonicCordova.deploy.download((res: any) => {
            if (res === 'true' || res == 'false') {

              // We can unzip the latest version
              IonicCordova.deploy.extract(appId, (res: any) => {
                if (res === 'true' || res == 'false') {

                  // we're ready to load the new version
                  IonicCordova.deploy.redirect(() => {
                    resolve(true)
                  }, (e: any) => { this.handleError(e, resolve) })
                } else {

                  // It's a progress update
                  console.log('Extract progress:', res)
                }
              }, (e: any) => { this.handleError(e, resolve) })
            } else {

              // It's a progress update
              console.log('Download progress:', res)
            }
          }, (e: any) => { this.handleError(e, resolve) })
        }
      }, (e: any) => { this.handleError(e, resolve) })
    });

  }

  handleError(error: any, callback: (err: any, success: boolean) => void) {
    console.error(error)
    callback(false)
  }
}
