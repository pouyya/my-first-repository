import {Validators} from "@angular/forms";

export enum ValidationOptions {
    Required = "Required",
    Regex = "Regex"
}

const validationOptionsMapping = {
  "Required": Validators.required,
  "Regex": Validators.pattern,
}

export class ValidationMeta {
    public entityTypeName: string;
    public validations: Validation[];
}

export class Validation {
    public variableName: string;
    public type: ValidationOptions;
    public value: string;
}

export class ValidationInfo{
    public static validationsList: Array<ValidationMeta> = new Array<ValidationMeta> ();

    public static getValidationsMeta(entityTypeName){
        const validations = ValidationInfo.validationsList.filter(validation => validation.entityTypeName === entityTypeName);
        if(validations.length){
          return validations[0];
        }
        return null;
    }

    public static getAllValidations(entityTypeName){
      const validationMeta = ValidationInfo.getValidationsMeta(entityTypeName);
      if(!validationMeta){
        return null;
      }
      const validationsMapping = validationMeta.validations.reduce((initialObj, validation) => {
          if(!initialObj[validation.variableName]){
            initialObj[validation.variableName] = [];
          }

          if(validation.type == ValidationOptions.Required){
              initialObj[validation.variableName].push(validationOptionsMapping[validation.type]);
          }else{
              initialObj[validation.variableName].push(validationOptionsMapping[validation.type](validation.value));
          }

          return initialObj;
      }, {});

      return validationsMapping;
    }
}

// Decorators
export function Required() {
  return function Required(target: any, propertyKey: string){
      const entityTypeName = target.constructor.name;
      let validationsMeta = ValidationInfo.getValidationsMeta(entityTypeName);
      if(!validationsMeta){
        validationsMeta = new ValidationMeta();
        validationsMeta.entityTypeName = entityTypeName;
        validationsMeta.validations = [];
        ValidationInfo.validationsList.push(validationsMeta);
      }

      let validation = new Validation();
      validation.variableName = propertyKey;
      validation.type = ValidationOptions.Required;
      validationsMeta.validations.push(validation);
  }
};

export function Regex(regex: string) {
    return function Required(target: any, propertyKey: string){
        const entityTypeName = target.constructor.name;
        let validationsMeta = ValidationInfo.getValidationsMeta(entityTypeName);
        if(!validationsMeta){
            validationsMeta = new ValidationMeta();
            validationsMeta.entityTypeName = entityTypeName;
            validationsMeta.validations = [];
            ValidationInfo.validationsList.push(validationsMeta);
        }

        let validation = new Validation();
        validation.variableName = propertyKey;
        validation.type = ValidationOptions.Regex;
        validation.value = regex;
        validationsMeta.validations.push(validation);
    }
};