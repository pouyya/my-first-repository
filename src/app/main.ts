import { ConfigService } from './../modules/dataSync/services/configService';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import { enableProdMode } from '@angular/core';

if (!ConfigService.isDevelopment()) {
    enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);