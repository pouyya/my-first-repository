import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { Role } from "../model/role";

export class RoleService extends BaseEntityService<Role> {

  constructor() {
    super(Role);
  }

}