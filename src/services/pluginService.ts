import { AlertController } from 'ionic-angular';
import { Platform } from 'ionic-angular';
import { PinDialog } from '@ionic-native/pin-dialog';
import { Injectable } from '@angular/core';

@Injectable()
export class PluginService {

  constructor(
    private platform: Platform, 
    private pinDialog: PinDialog,
    private alertCtrl: AlertController) {

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
      if (this.platform.is('andriod') || this.platform.is('ios') || this.platform.is('mobile') || this.platform.is('tablet')) {
        this.pinDialog.prompt(message, title, [
          buttons.ok || 'OK', buttons.cancel || 'Cancel'
        ]).then((result: any) => {
          if (result.buttonIndex == 1) {
            resolve(Number(result.input1));
          } else if (result.buttonIndex == 2) {
            reject(false);
          }
        }).catch((error) => {
          reject(error);
        });
      } else {
        let prompt = this.alertCtrl.create({
          title,
          message,
          inputs,
          buttons: [
            {
              text: buttons.ok || 'OK',
              handler(data: any) {
                resolve(Number(data[inputs[0].name || 'pin']));
              }
            },
            {
              text: buttons.cancel || 'Cancel',
              handler() {
                reject();
              }
            }
          ],
        });
        prompt.present();
      }
    });
  }

}