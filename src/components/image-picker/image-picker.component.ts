import { Component, Input } from "@angular/core";
import { ModalController } from "ionic-angular";
import { Subject } from "rxjs/Subject";
import {Camera, CameraOptions} from "@ionic-native/camera";
import {SelectLocationModal} from "./modal/select-color/select-location";

@Component({
  selector: 'image-picker',
  template: `<ion-label class="item-addImageLabel">Add Image</ion-label>
  <button type="button" ion-button icon-only (click)="selectImage()">
      <ion-icon name="camera"></ion-icon>
  </button><div [style.display]="(selectedThumbnail$ | async )? 'block' : 'none' "><img [src]="selectedThumbnail$ | async"/></div>`
  ,
  styleUrls: ['/components/color-picker.scss']
})
export class ImagePickerComponent {
  @Input() selectedImage$: Subject<String>;
  @Input() selectedThumbnail$: Subject<String>;
  constructor(private camera: Camera, private modalCtrl: ModalController) {
  }

  public selectImage() {
      let modal = this.modalCtrl.create(SelectLocationModal);
      modal.onDidDismiss(data => {
          if(data.status) {
              this.createImage(data.type);
          }
      });
      modal.present();

  }

  private async createImage(type){
      const localtionTypes = {
          CAMERA: this.camera.PictureSourceType.CAMERA,
          GALLERY: this.camera.PictureSourceType.PHOTOLIBRARY
      }
      const options: CameraOptions = {
          quality: 100,
          destinationType: this.camera.DestinationType.DATA_URL,
          sourceType: localtionTypes[type],
          correctOrientation: true,
          allowEdit: false
      };
      try {
          const imageData = await this.camera.getPicture(options);
          const image = 'data:image/jpeg;base64,' + imageData;
          this.selectedImage$.next(image);
          const thumbnail = await this.createThumbnail(image);
          this.selectedThumbnail$.next(thumbnail);
      }catch (err){
          console.log('gallery error: ', err);
      }
  }
  private createThumbnail(image: string): Promise<string> {
      return new Promise((resolve, reject) => {
          this.generateFromImage(image, 200, 200, 0.5, data => {
              resolve(data);
          });
      });
  }

  private generateFromImage(img, MAX_WIDTH: number = 700, MAX_HEIGHT: number = 700, quality: number = 1, callback) {
    var canvas: any = document.createElement("canvas");
    var image = new Image();

    image.onload = () => {
        var width = image.width;
        var height = image.height;

        if (width > height) {
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
            }
        }
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");

        ctx.drawImage(image, 0, 0, width, height);

        var dataUrl = canvas.toDataURL('image/jpeg', quality);

        callback(dataUrl)
    }
    image.src = img;
  }
}