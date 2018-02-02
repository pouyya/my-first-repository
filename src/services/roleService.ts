import { BaseEntityService } from "./baseEntityService";
import { Role } from "../model/role";

export class RoleService extends BaseEntityService<Role> {

  constructor() {
    super(Role);
  }

}