import { Injectable } from '@angular/core';
import _ from 'lodash';
import { BaseEntityService } from "@simplepos/core/dist/services/baseEntityService";
import {ISection, ITable, TableArrangement} from "../model/tableArrangement";
import {SyncContext} from "./SyncContext";

@Injectable()
export class TableArrangementService extends BaseEntityService<TableArrangement> {
    constructor(private syncContext: SyncContext) {
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

    public async getStoreTables(storeId?: string): Promise<ITable[]> {
        if(!storeId){
            storeId = this.syncContext.currentStore._id;
        }
        const tableArrangement = await this.getTableArrangement();
        const sections = tableArrangement.sections.filter(section => section.storeId === storeId);
        let tables = [];
        sections.forEach(section => {
            tables = [...tables, ...section.tables];
        });
        return tables;
    }

    private async getSection(sectionId: string): Promise<ISection>{
        const tableArrangement = await this.getTableArrangement();
        const section = tableArrangement.sections.filter(section => section.id === sectionId);
        return section;
    }

    private getSectionFromTableId(tableId, tableArrangement){
        let selectedSection = null;
        tableArrangement.sections.some(section => {
            section.tables.some(table => {
                if(table.id === tableId){
                    selectedSection = section;
                    return true;
                }
            });
            if(selectedSection){
                return true;
            }
        });
        return selectedSection;
    }
    public async getAllSections(): Promise<ISection[]> {
        const tableArrangement = await this.getTableArrangement();
        return tableArrangement.sections;
    }

    public async getCurrentStoreSections(): Promise<ISection[]> {
        const tableArrangement = await this.getTableArrangement();
        return tableArrangement.sections.filter(section => section.storeId === this.syncContext.currentStore._id);
    }

<<<<<<< HEAD
    public async addTable(table: ITable, sectionId: string){
=======
    public async addTable(table: ITable, sectionId: string, toSectionId: string) {
>>>>>>> parent of af12d245... remove bugs
        const tableArrangement = await this.getTableArrangement();
        let section;
        if(!sectionId){
            section = this.getSectionFromTableId(table.id, tableArrangement);
        }else{
            const sections = tableArrangement.sections.filter(section => section.id === sectionId);
            sections.length && ( section = sections[0] );
        }

        if(section) {
            section.tables.push(table);
            await this.update(tableArrangement);
        }
    }

    public async updateTable(tableData: ITable, sectionId: string, toSectionId: string) {
        const tableArrangement = await this.getTableArrangement();
        let section;
        if (sectionId != toSectionId)
        this.moveTable(tableData, toSectionId, sectionId);
    else {

        if (!sectionId) {
            section = this.getSectionFromTableId(tableData.id, tableArrangement);
        } else {
            const sections = tableArrangement.sections.filter(section => section.id === sectionId);
            sections.length && (section = sections[0]);
        }


        if (section) {
            let tableIndex = _.findIndex(section.tables, { id: tableData.id });
            if (tableIndex != -1) {
                section.tables[tableIndex] = { ...section.tables[tableIndex], ...tableData };
                await this.update(tableArrangement);
            }


    }
}
    }
    public async deleteTable(tableId: string, sectionId: string){
        const tableArrangement = await this.getTableArrangement();
        let section;
        if(!sectionId){
            section = this.getSectionFromTableId(tableId, tableArrangement);
        }else{
            const sections = tableArrangement.sections.filter(section => section.id === sectionId);
            sections.length && ( section = sections[0] );
        }

        if(section) {
            _.remove(section.tables, {id: tableId});
            await this.update(tableArrangement);
        }
    }

    public async moveTable(table: ITable, sourceSectionId: string, destinationSectionId: string) {
        await this.deleteTable(table.id, sourceSectionId);
        await this.addTable(table, destinationSectionId);
    }

    public async addSection(section: ISection) {
        const tableArrangement = await this.getTableArrangement();
        section.tables = [];
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
        _.remove(tableArrangement.sections, {id: sectionId});
        await this.update(tableArrangement);
    }
}