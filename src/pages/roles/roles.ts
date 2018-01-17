import { RoleDetails } from './../role-details/role-details';
import { NavController } from 'ionic-angular';
import { Component } from '@angular/core';
import { BackOfficeModule } from './../../modules/backOfficeModule';
import { PageModule } from '../../metadata/pageModule';
import { Role } from '../../model/role';
import { RoleService } from '../../services/roleService';

@PageModule(() => BackOfficeModule)
@Component({
  selector: 'roles',
  templateUrl: 'roles.html'
})
export class Roles {

  public roles: Role[];

  constructor(
    private navCtrl: NavController,
    private roleService: RoleService
  ) {

  }

  async ionViewDidEnter() {
    this.roles = await this.roleService.getAll();
  }

  public view(role?: Role) {
    this.navCtrl.push(RoleDetails, { role });
  }
}