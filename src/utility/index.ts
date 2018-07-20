import { Injectable } from "@angular/core";
import { AlertController, ToastController } from "ionic-angular";
import { ValidationInfo } from "../metadata/validationModule";
import { Validators } from "@angular/forms";
import * as moment from "moment-timezone";
import {SyncContext} from "../services/SyncContext";

@Injectable()
export class Utilities {
  constructor(private alertCtrl: AlertController, private toastCtrl:ToastController, private syncContext: SyncContext){}

  public checkUnsavedChanges(isDataChanged) {
    return new Promise<boolean>((resolve) => {
      if (isDataChanged) {
        let confirm = this.alertCtrl.create({
          title: 'Warning!',
          message: 'There is unsaved data. Do you want to discard it?',
          buttons: [
            {
              text: 'Discard It!',
              handler: async () => {
                resolve(true);
                let toast = this.toastCtrl.create({
                  message: 'The unsaved changes are now discarded.',
                  duration: 5000
                });
                toast.present();
              }
            },
            {
              text: 'Let me save',
              handler: () => {
                resolve(false);
              }
            }
          ]
        });
        confirm.present();
      } else {
        resolve(true);
      }
    });
  }

  public createGroupValidation(entityTypeName, fields, data){
    const validationMapping = ValidationInfo.getAllValidations(entityTypeName);
    const groupValidation = {};
    fields.forEach(field => {
      groupValidation[field] = [];
      groupValidation[field].push(data[field] || null);
      validationMapping[field] && groupValidation[field].push(Validators.compose(validationMapping[field]));
    });

    return groupValidation;
  }

  public setFormFields(form, fields, data){
    fields.forEach(field => {
      data[field] = form.controls[field].value;
    });
  }

  public sort(items: any[], sortList: string[]){
      items.sort( (itemA, itemB) => {
        if(sortList.indexOf(itemB._id) === -1){
          return 0;
        }
        return sortList.indexOf(itemA._id) - sortList.indexOf(itemB._id);
      });
  }

  public confirmRemoveItem(message: string){
    return new Promise((resolve, reject) => {
        let confirm = this.alertCtrl.create({
            title: 'Warning!',
            message,
            buttons: [
                {
                    text: 'Yes',
                    handler: async () => {
                        resolve(true);
                    }
                },
                {
                    text: 'Cancel',
                    handler: () => {
                        resolve(false);
                    }
                }
            ]
        });
        confirm.present();
    });
  }

  public convertTimezone(date){
      return this.syncContext.timezone ? moment.tz(date, this.syncContext.timezone) : moment.utc(date).local();
  }
}