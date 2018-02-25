import { Platform } from 'ionic-angular';
import { PinDialog } from '@ionic-native/pin-dialog';
import { Dialogs } from '@ionic-native/dialogs';
import { AlertController } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { AuditService } from './auditService';

@Injectable()
export class PluginService {
  constructor(
    private platform: Platform,
    private pinDialog: PinDialog,
    private dialog: Dialogs,
    private alertCtrl: AlertController,
    private auditService: AuditService) {
  }

  /**
   * Opens PIN Dialog both Natively and Browser-Level
   * @param title 
   * @param message 
   * @param inputs 
   * @param buttons 
   * @returns {Promise<any>}
   */
  public openPinPrompt(title: string, message: string, inputs: Array<any> = [], buttons?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.checkMobileDevices()) {
        this.pinDialog.prompt(message, title, [
          buttons.ok || 'OK', buttons.cancel || 'Cancel'
        ]).then((result: any) => {
          if (result.buttonIndex == 1) {
            const pin = Number(result.input1);
            this.auditService.addAuditInfo(pin);
            resolve(pin);
          } else if (result.buttonIndex == 2) {
            resolve(null);
          }
        }).catch((error) => {
          reject(error);
        });
      } else {
        inputs.length == 0 && (inputs = [{ name: 'pin', placeholder: 'xxxx', type: 'number' }]);
        let self = this;
        let prompt = this.alertCtrl.create({
          title,
          message,
          inputs,
          buttons: [
            {
              text: buttons.ok || 'OK',
              handler(data: any) {
                const pin = Number(data[inputs[0].name || 'pin']);
                self.auditService.addAuditInfo(pin);
                resolve(pin);
              }
            },
            {
              text: buttons.cancel || 'Cancel',
              handler() {
                resolve();
              }
            }
          ],
        });
        prompt.present();
      }
    });
  }

  /**
   * check for all mobile devices supporting cordova platforms
   */
  private checkMobileDevices() {
    return this.platform.is('andriod') ||
      this.platform.is('ios') ||
      this.platform.is('mobile') ||
      this.platform.is('tablet') ||
      this.platform.is('phablet') ||
      this.platform.is('ipad') ||
      this.platform.is('cordova');
  }

  public openDialoge(title: string, subTitle?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.checkMobileDevices()) {
        this.dialog.alert(title)
          .then(() => resolve())
          .catch(e => reject(e));
      } else {
        let options: any = { title, buttons: ['OK'] }
        subTitle && (options.subTitle = subTitle)
        let alert = this.alertCtrl.create(options);
        alert.present();
        resolve();
      }
    });
  }
}
