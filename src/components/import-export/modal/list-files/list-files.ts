import { Component } from '@angular/core';
import {LoadingController, Platform, ViewController} from "ionic-angular";
import {File} from "@ionic-native/file";
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer";

@Component({
  selector: "list-files",
  templateUrl: "./list-files.html"
})
export class ListFilesModal {
  private files = [];
  private savedParentNativeURLs = [];
  private ROOT_DIRECTORY = 'file:///';
  public csvUrl: string = "";
  private fileTransfer: FileTransferObject;

  constructor(
    private viewCtrl: ViewController, private file: File, private platform: Platform, private transfer: FileTransfer,
    private loading: LoadingController) {
      platform.ready().then(() => {
          this.fileTransfer = this.transfer.create();
          if(!this.platform.is('ios')){
            this.listDir(this.ROOT_DIRECTORY, '');
          }
      });
  }

  public dismiss() {
    this.viewCtrl.dismiss({ status: false, file: null });
  }

  public async loadFile(){
    if(this.csvUrl) {
        let loader = this.loading.create({ content: 'Downloading file' });
        await loader.present();
        this.fileTransfer.download(this.csvUrl, this.file.dataDirectory + 'file.csv').then((file) => {
            this.selectFile(file, this.file.dataDirectory);
            loader.dismiss();
        }, (error) => {
            alert('Some Error occured:' + JSON.stringify(error));
        });
    }
  }

  public async selectFile(file, rootDirectory?) {
      try {
          const data = await this.file.readAsBinaryString(rootDirectory || this.ROOT_DIRECTORY, file.fullPath.slice(1));
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