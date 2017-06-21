import { NgZone, Injectable } from '@angular/core';
import { User } from './../model/user';
import { BaseEntityService } from './baseEntityService';
import { userData } from './../metadata/userMock';

@Injectable()
export class UserService extends BaseEntityService<User> {
  constructor(private zone: NgZone) {
    super(User, zone);
  }

  public getLoggedInUser(): any {
    let user = {};
    user = JSON.parse(localStorage.getItem('user'));
    if(!user) {
      user = { ...userData };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return user; 
  }

  public getUser() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch(e) {
      throw new Error(e);
    }
  }
}