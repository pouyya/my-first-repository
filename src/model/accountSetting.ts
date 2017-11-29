import { DBBasedEntity } from "./dbBasedEntity";

export class AccountSetting extends DBBasedEntity {
    public name: string;
    public receiptFooterMessage: string;
}