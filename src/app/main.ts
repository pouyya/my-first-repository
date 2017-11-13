import './../modules/globalInjector';
import { ConfigService } from './../services/configService';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';
import { enableProdMode, ComponentRef } from '@angular/core';

if (!ConfigService.isDevelopment()) {
    enableProdMode();
}


platformBrowserDynamic().bootstrapModule(AppModule);
