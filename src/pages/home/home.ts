import { PrintService } from './../../services/printService';
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';

@PageModule(() => BackOfficeModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, private printService: PrintService) {

  }

  public callMe(){
    this.printService.print('asd');
  }

}
