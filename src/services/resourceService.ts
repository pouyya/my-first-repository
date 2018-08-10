import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import 'rxjs/add/operator/map'
import { Observable } from "rxjs";

@Injectable()
export class ResourceService {
    data;
    constructor(private http: Http) {

     
     }

    async getCountries(): Promise<any> {
        var result = await this.http.get('assets/countries.json')
            .toPromise();
        return result.json();
    }

    async getStates(countryCode: string): Promise<any> {
        var result = await this.http.get('assets/states.json')
            .toPromise();
        var data= result.json();
        for (let i = 0; i < data.countries.length; i++) {
            const element = data.countries[i];
            if(element.code==countryCode){
               return element.states.sort();
			}
        }
        return null;
    }
    
}
