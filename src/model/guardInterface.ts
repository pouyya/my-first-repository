import { SecurityResult } from './../infra/security/model/securityResult';
import { AccessRightItem } from './accessItemRight';

export interface GuardInterface {

  canAccess<T extends AccessRightItem>(accessRightItems: T[]): Promise<SecurityResult>;

}