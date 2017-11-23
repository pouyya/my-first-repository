export class UserSession {
  
  public access_token: string;
  public expires_in: number;
  public token_type: string;
  public settings: any; /* Can be crafted into a separate interface */
  public currentStore?: string;
  public currentPos?: string;

}