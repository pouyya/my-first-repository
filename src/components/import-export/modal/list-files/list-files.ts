import { Component } from '@angular/core';
import {Platform, ViewController} from "ionic-angular";
import {File} from "@ionic-native/file";

@Component({
  selector: "list-files",
  templateUrl: "./list-files.html"
})
export class ListFilesModal {
  private files = [];
  private savedParentNativeURLs = [];
  private ROOT_DIRECTORY = 'file:///';

  constructor(
    private viewCtrl: ViewController, private file: File, private platform: Platform) {
      platform.ready().then(() => {
          this.listDir(this.ROOT_DIRECTORY, '');
      });
  }

  public dismiss() {
    this.viewCtrl.dismiss({ status: false, file: null });
  }

  public async selectFile(file) {
      try {
          const data = await this.file.readAsBinaryString(this.ROOT_DIRECTORY, file.fullPath.slice(1));
          this.viewCtrl.dismiss({ status: true, file: data });
      }catch (ex){
          alert(JSON.stringify(ex));
      }
  }

  private listDir(path, dirName) {
      this.file.listDir(path, dirName)
          .then((entries) => {
              this.files = entries;
          })
          .catch((error) => {
              alert(error);
          });
  }

  public goDown(file) {
      if(file.isFile){
          return this.selectFile(file);
      }
      const parentNativeURL = file.nativeURL.replace(file.name, '');
      this.savedParentNativeURLs.push(parentNativeURL);
      this.listDir(parentNativeURL, file.name);
  }

  public goUp() {
      const parentNativeURL = this.savedParentNativeURLs.pop();
      this.listDir(parentNativeURL, '');
  }
}