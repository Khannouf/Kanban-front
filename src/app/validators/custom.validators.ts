import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";


export class CustomValidators {
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[\W_]/.test(value);
      
      const isStrong = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
      if (!isStrong) {
        return { strongPassword: { value: control.value } };
      }
      return null;
    };
  }
}