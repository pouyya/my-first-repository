import { DBBasedEntity } from '@simplepos/core/dist/model/dbBasedEntity';

export enum TableStatus {
    Open = 'open',
    Closed = 'closed',
    Active = 'active'
}

export class TableArrangement extends DBBasedEntity{
    public sections: ISection[];
    constructor(){
        super();
        this.sections = [];
    }
}

export interface ITable{
    id: string;
    name: string;
    size: number;
    numberOfGuests: number;
    status: string;
    createdAt: string;
}

export interface ISection {
    id: string;
    name: string;
    storeId: string;
    createdAt: string;
    tables: ITable[];
}