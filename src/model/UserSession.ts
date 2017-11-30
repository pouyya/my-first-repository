export interface AppSettingsInterface {
  defaultTax?: string;
  taxEntity?: string;
  taxType?: any;
  trackEmployeeSales?: boolean;
  screenAwake?: boolean;
  db_url?: string;
  db_name?: string;
  db_local_name?: string;
  defaultIcon?: any;
  
}

export class UserSession {
  
  public access_token: string;
  public expires_in: number;
  public token_type: string;
  public settings: AppSettingsInterface;
  public currentStore?: string;
  public currentPos?: string;

}