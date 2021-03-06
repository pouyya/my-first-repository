export interface AppSettingsInterface {
  defaultTax?: string;
  taxEntity?: string;
  taxType?: any;
  trackEmployeeSales?: boolean;
  screenAwake?: boolean;
  db_url?: string;
  db_critical_name?: string;
  db_critical_local_name?: string;  
  db_name?: string;
  db_local_name?: string;
  db_audit_name?: string;
  db_audit_local_name?: string;
  defaultIcon?: any;
}

export class UserSession {
  public access_token: string;
  public settings: AppSettingsInterface;
  public currentStore?: string;
  public currentPos?: string;
}