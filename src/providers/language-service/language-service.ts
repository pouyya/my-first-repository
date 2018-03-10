import { Injectable } from '@angular/core';
import { LanguageModel } from "../../model/language.model";

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
