import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import 'rxjs/add/operator/map'

@Injectable()
export class ResourceService {

    constructor(private http: Http) { }

    async getCountries(): Promise<any> {

        var result = await this.http.get('assets/countries.json')
            .toPromise();

        result.json();
    }
}
