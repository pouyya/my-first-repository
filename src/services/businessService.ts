import { Injectable } from "@angular/core";
import { Business } from "../model/business";
import { Http } from "@angular/http";
import _ from "lodash";

export enum DBType {
    Current = 'current',
    Critical = 'critical',
    Archive = 'archive',
    Audit = 'audit'
}

@Injectable()
export class BusinessService {
    private static repo: Array<Business> = [
        Business.Barber,
        Business.Coffeeshop,
        Business.General,
    ];

    constructor(private http: Http) { }

    public getAll(): Array<Business> {
        return BusinessService.repo;
    }

    public async getDataTemplate(business: Business, dbType: DBType): Promise<string> {

        var result = await this.http
            .get(`assets/data-templates/${business.templateName}/${dbType}.json`)
            .toPromise();

        return result.text();
    }
}