import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';
import { IonicProDeployService } from './ionic-pro-deploy.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class IonicProDeployModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: IonicProDeployModule,
      providers: [IonicProDeployService]
    };
  }
}