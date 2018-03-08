import { Injectable } from '@angular/core';
import { LanguageModel } from "../../model/language.model";

/*
  Generated class for the LanguageServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LanguageServiceProvider {
  languages : Array<LanguageModel> = new Array<LanguageModel>();


  constructor() {
    console.log('LanguageServiceProvider Provider');
    this.languages.push(
      {name: "Australia", code: "au"}
    );
  }

  getLanguages(){
    return this.languages;
  }

}
