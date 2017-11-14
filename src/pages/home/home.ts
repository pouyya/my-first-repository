import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { BackOfficeModule } from '../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { SecurityGuard } from '../../metadata/securityGuardModule';
import { BackOfficePageRoleModule } from '../../modules/roles/backOfficePageRoleModule';

@SecurityGuard(() => BackOfficePageRoleModule)
@PageModule(() => BackOfficeModule)
@Component({
  selector: 'page-variables',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController) {

  }

}
