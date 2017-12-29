import { Closure } from './../model/closure';
import { Injectable } from '@angular/core';
import { BaseEntityService } from './baseEntityService';

@Injectable()
export class ClosureService extends BaseEntityService<Closure> {

  constructor() {
    super(Closure)
  }
}