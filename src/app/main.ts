import './../modules/globalInjector';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import { enableProdMode } from '@angular/core';
import { ConfigService } from '../modules/dataSync/services/configService';

if (!ConfigService.isDevelopment()) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);