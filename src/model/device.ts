import { DBModeEnum, DBMode } from "@simpleidea/simplepos-core/dist/metadata/dbMode";
import { DBBasedEntity } from "@simpleidea/simplepos-core/dist/model/dbBasedEntity";


export enum DeviceType {
    Bump
}

@DBMode(DBModeEnum.Current)
export class Device extends DBBasedEntity {
    name: string;//mandatory
    storeId: string; //madnatory - current store
    posIds: string[]; //optional
    type: DeviceType; //mandatory
    associatedPurchasableItemIds: string[]
}