import { Injectable } from "@angular/core";
import { AccountSetting } from "../model/accountSetting";
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";

@Injectable()
export class AccountSettingService extends BaseEntityService<AccountSetting>{
    constructor() {
        super(AccountSetting);
    }

    public async getCurrentSetting(): Promise<AccountSetting> {
        var settings = await this.getAll();

        if (!settings || settings.length == 0) {
            return new AccountSetting();
        }

        return settings[0];
    }
}
