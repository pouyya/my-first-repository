import { RoleService } from './../../../../services/roleService';
import _ from 'lodash';
import { ViewController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core';
import { Role } from '../../../../model/role';

class SelectableRole extends Role {
  selected: boolean;
}

@Component({
  selector: 'select-roles-modal',
  templateUrl: 'select-roles.html'
})
export class SelectRolesModal {

  public store: any;
  public roles: SelectableRole[] = [];
  public selectedRole: SelectableRole;

  constructor(
    private roleService: RoleService,
    private navParams: NavParams,
    private viewCtrl: ViewController
  ) {
    this.store = this.navParams.get('store');
  }

  async ionViewDidLoad() {
    let noAccess = new SelectableRole();
    noAccess._id = null;
    noAccess.name = 'No Access';
    noAccess.accessRightItems = [];
    this.roles = [noAccess].concat((await this.roleService.getAll()).map(role => {
      return <SelectableRole>{
        ...role,
        selected: false
      }
    }));
    this.selectedRole = this.store.role ? _.find(this.roles, { _id: this.store.role }) || noAccess : noAccess;
  }

  public dismiss() {
    this.viewCtrl.dismiss({ selectedRole: this.selectedRole._id });
  }

  public applypermissionlevel() {
    this.store.role=this.selectedRole._id;
    if(this.selectedRole._id)
    {
      if(!this.store.selected){
        this.store.selected=true;
      }
    }
    else
    {
      this.store.selected=false;
    }
    this.dismiss();
  }
  
}