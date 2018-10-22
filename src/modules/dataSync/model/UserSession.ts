export interface AppSettingsInterface {
  defaultTax?: string;
  taxEntity?: string;
  taxType?: any;
  trackEmployeeSales?: boolean;
  screenAwake?: boolean;
  defaultIcon?: any;
}

export class UserSession {
  constructor() {
    this.settings = {};
  }

  public settings: AppSettingsInterface;
  public currentStore?: string;
  public currentPos?: string;
}