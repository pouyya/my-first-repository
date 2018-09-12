import { DBBasedEntity } from '@simplepos/core/dist/model/dbBasedEntity';

export enum TableStatus {
    Open = 'open',
    Closed = 'closed'
}

export class TableArrangement extends DBBasedEntity{
    public tables: ITable[];
    public sections: ISection[];
    constructor(){
        super();
        this.tables = [];
        this.sections = [];
    }
}

export interface ITable{
    id: string;
    name: string;
    sectionId: string;
    size: number;
    status: string;
    storeId: string;
    createdAt: string;
}

export interface ISection {
    id: string;
    name: string;
    storeId: string;
    createdAt: string;
}