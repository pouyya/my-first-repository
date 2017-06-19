import { NgZone, Injectable } from '@angular/core';
import { User } from './../model/user';
import {BaseEntityService} from './baseEntityService';

@Injectable()
export class UserService extends BaseEntityService<User> {
  constructor(private zone: NgZone) {
    super(User, zone);
  }

  public getLoggedInUser() {
    return this.get("2017-06-16T10:19:57.208Z");
  }

  public getUser() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch(e) {
      throw new Error(e);
    }
  }
}