import { Injectable, Injector, ErrorHandler } from '@angular/core';
import { IonicErrorHandler } from 'ionic-angular';
import { Firebase } from '@ionic-native/firebase';

@Injectable()
export class AppErrorHandler extends IonicErrorHandler implements ErrorHandler {

  constructor(private firebase: Firebase) {
    super()
  }

  /**
   * Handles error along with logging on Firebase
   * @param err 
   */
  handleError(err: any): void {
    this.firebase.logError(err.message);
    super.handleError(err);
  }
}