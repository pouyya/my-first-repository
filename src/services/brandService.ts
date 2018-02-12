import { Brand } from './../model/brand';
import { Injectable } from '@angular/core';
import { BaseEntityService } from "@simpleidea/simplepos-core/dist/services/baseEntityService";

@Injectable()
export class BrandService extends BaseEntityService<Brand> {

  constructor() {
    super(Brand);
  }

}