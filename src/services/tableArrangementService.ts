import { Injectable } from '@angular/core';
import _ from 'lodash';
import { BaseEntityService } from "@simplepos/core/dist/services/baseEntityService";
import {ISection, ITable, TableArrangement} from "../model/tableArrangement";

@Injectable()
export class TableArrangementService extends BaseEntityService<TableArrangement> {
    constructor() {
        super(TableArrangement);
    }

    private async getTableArrangement(){
        let tableArrangement: any = await this.getAll();
        if (tableArrangement.length === 0) {
            tableArrangement = new TableArrangement();
            tableArrangement = await this.add(tableArrangement);
        } else {
          tableArrangement = tableArrangement[0];
        }
        return tableArrangement;
    }
    public async getAllTables(): Promise<ITable[]> {
        const tableArrangement = await this.getTableArrangement();
        return tableArrangement.tables;
    }

    public async getAllSections(): Promise<ISection[]> {
        const tableArrangement = await this.getTableArrangement();
        return tableArrangement.sections;
    }

    public async addTable(table: ITable){
        const tableArrangement = await this.getTableArrangement();
        tableArrangement.tables.push(table);
        await this.update(tableArrangement);
    }

    public async updateTable(tableData: ITable){
        const tableArrangement = await this.getTableArrangement();
        let tableIndex = _.findIndex(tableArrangement.tables, {id: tableData.id});
        if(tableIndex != -1){
            tableArrangement.tables[tableIndex] = { ...tableArrangement.tables[tableIndex], ...tableData };
            await this.update(tableArrangement);
        }
    }

    public async deleteTable(tableId: string){
        const tableArrangement = await this.getTableArrangement();
        _.remove(tableArrangement.tables, {_id: tableId});
        await this.update(tableArrangement);
    }

    public async addSection(section: ISection){
        const tableArrangement = await this.getTableArrangement();
        tableArrangement.sections.push(section);
        await this.update(tableArrangement);
    }

    public async updateSection(sectionData: ISection){
        const tableArrangement = await this.getTableArrangement();
        let sectionIndex = _.findIndex(tableArrangement.sections, {id: sectionData.id});
        if (sectionIndex != -1) {
            tableArrangement.sections[sectionIndex] = { ...tableArrangement.sections[sectionIndex], ...sectionData };
            await this.update(tableArrangement);
        }
    }

    public async deleteSection(sectionId: string){
        const tableArrangement = await this.getTableArrangement();
        _.remove(tableArrangement.sections, {_id: sectionId});
        await this.update(tableArrangement);
    }
}