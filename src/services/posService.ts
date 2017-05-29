import { Injectable } from '@angular/core'

@Injectable()
export class PosService {

  public getCurrentPosID(): string {
    // TODO: Replace hardcoded POSID with sessions stored ID
    return 'AAD099786746352413F';
  }
}