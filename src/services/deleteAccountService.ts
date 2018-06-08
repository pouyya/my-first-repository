import _ from 'lodash';
import * as moment from 'moment';
import { Injectable } from '@angular/core';
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";
import { Http, Response } from '@angular/http';
import { ENV } from '@app/env';
import { UserService } from '../modules/dataSync/services/userService';
 
@Injectable()
export class DeleteAccountService {
 
    constructor(private http: Http,
        private userService: UserService) {
    }


    public async deleteAccount() {
        return this.http
        .get(`${ENV.service.baseUrl}/wp-content/plugins/simple-idea-user-management/user-manager-api.php?action=eraseAllUserData&Authorization=${await this.userService.getUserToken()}`)
        .map((response: Response) => response.json());
    }
}