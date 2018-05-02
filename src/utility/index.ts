import { Injectable } from "@angular/core";
import { AlertController, ToastController } from "ionic-angular";
import { ValidationInfo } from "../metadata/validationModule";
import { Validators } from "@angular/forms";

@Injectable()
export class Utilities {
  constructor(private alertCtrl: AlertController, private toastCtrl:ToastController){}

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
}