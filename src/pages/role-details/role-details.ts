import { SecurityAccessRightRepo } from './../../model/securityAccessRightRepo';
import { AccessRightItem } from './../../model/accessItemRight';
import { NavParams, NavController } from 'ionic-angular';
import { RoleService } from './../../services/roleService';
import { Component } from '@angular/core';
import { Role } from '../../model/role';
import { SecurityModule } from '../../infra/security/securityModule';
import { PageModule } from '../../metadata/pageModule';
import { SettingsModule } from '../../modules/settingsModule';

interface InteractableAccessRightItem extends AccessRightItem {
  selected: boolean;
}

@PageModule(() => SettingsModule)
@SecurityModule(SecurityAccessRightRepo.RoleAddEdit)
@Component({
  selector: 'role-details',
  templateUrl: 'role-details.html'
})
export class RoleDetails {

  public role: Role = new Role();
  public accessRightItems: InteractableAccessRightItem[] = [];
  public isNew = true;
  public action = 'Add';

  constructor(
    private roleService: RoleService,
    private navCtrl: NavController,
    private navParams: NavParams
  ) {
    let role = <Role>navParams.get('role');
    if (role) {
      this.role = role;
      this.isNew = false;
      this.action = 'Edit';
    }

    this.accessRightItems = SecurityAccessRightRepo.Repo.map(accessRightItem => {
      let selected = false;
      if(!this.isNew && this.role.accessRightItems.indexOf(accessRightItem.id) > -1) {
        selected = true;
      }
      return <InteractableAccessRightItem>{
        id: accessRightItem.id,
        name: accessRightItem.name,
        description: accessRightItem.description || null,
        selected
      };
    });
  }

  public onSelect(event, accessRightItem: InteractableAccessRightItem) {
    accessRightItem.selected = !accessRightItem.selected;
  }

  public async save(): Promise<any> {
    try {
      this.role.accessRightItems = this.accessRightItems
        .filter(accessRightItem => accessRightItem.selected)
        .map(accessRightItem => accessRightItem.id);
  
      await this.roleService[this.isNew ? 'add' : 'update'](this.role);
      return this.navCtrl.pop();
    } catch (err) {
      throw new Error(err);
    }
  }

  public async remove(): Promise<any> {
    try {
      await this.roleService.delete(this.role);
      return this.navCtrl.pop();
    } catch (err) {
      throw new Error(err);
    }
  }

}