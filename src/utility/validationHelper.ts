import { AbstractControl, Validators } from "@angular/forms";

export class ValidationHelper {

    public static checkNameCombination(control: AbstractControl) {
        if (control && control.value && !control.value.firstName && !control.value.lastName) {
            return { oneRequired: true };
        }
        return null;
    }

    public static emptyOrEmail(input: AbstractControl) {
        return (!input.value || input.value === '') ? null : Validators.email(input);
    }
}