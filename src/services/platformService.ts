import { Platform } from 'ionic-angular';
import { Injectable } from "@angular/core";

@Injectable()
export class PlatformService {
    constructor(private platform: Platform) {
    }

    isMobileDevice(): boolean {
        return !this.platform.is('core');
    }
}