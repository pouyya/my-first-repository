import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { IonicErrorHandler } from 'ionic-angular';
import { ErrorLoggingService } from "./ErrorLoggingService";

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;
  errorLoggingService: ErrorLoggingService;

  constructor(injector: Injector) {
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
      this.errorLoggingService = injector.get(ErrorLoggingService);
    } catch (e) {
    }
  }

  handleError(err: any): void {
    this.errorLoggingService.handleNewError(err);
    this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
  }
}