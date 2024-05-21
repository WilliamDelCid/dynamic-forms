import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit {
  @Input() rows: number = 1;
  @Input() columns: number = 2;
  @Input() fields: {
    name: string,
    type: string,
    placeholder: string,
    label: string,
    required: boolean,
    validators?: string[],
    errorMessages?: { [key: string]: string }
  }[] = [];
  @Input() boxConfig: any;
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      rows: this.fb.array([])
    });
  }

  ngOnInit() {
    this.createForm();
  }

  get rowsArray(): FormArray {
    return this.form.get('rows') as FormArray;
  }

  createForm() {
    const rowCount = Math.ceil(this.fields.length / this.columns);
    for (let i = 0; i < rowCount; i++) {
      this.rowsArray.push(this.createRow());
    }
  }

  createRow(): FormGroup {
    const group = this.fb.group({});
    const startIndex = this.rowsArray.length * this.columns;
    const endIndex = startIndex + this.columns;
    const fieldsForRow = this.fields.slice(startIndex, endIndex);

    fieldsForRow.forEach(field => {
      const validators = this.getValidators(field.validators);
      const control = this.fb.control('', validators);
      group.addControl(field.name, control);
    });

    return group;
  }

  getValidators(validatorNames?: string[]): any[] {
    const validatorMap: { [key: string]: any } = {
      required: Validators.required,
      email: Validators.email,
      minlength: Validators.minLength,
      maxlength: Validators.maxLength,
      pattern: Validators.pattern
    };

    if (!validatorNames) {
      return [];
    }

    return validatorNames.map(name => {
      if (name.includes('minlength') || name.includes('maxlength') || name.includes('pattern')) {
        const [validatorName, param] = name.split(':');
        return validatorMap[validatorName](param);
      }
      return validatorMap[name];
    });
  }

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value.rows);
    } else {
      this.form.markAllAsTouched();
      console.log("Form is invalid");
    }
  }

  getErrorMessage(control: AbstractControl | null, field: any): string {
    if (control && control.errors) {
      for (const errorKey in control.errors) {
        if (field.errorMessages && field.errorMessages[errorKey]) {
          return field.errorMessages[errorKey];
        }
        // Default error messages
        if (errorKey === 'required') {
          return 'This field is required';
        }
        if (errorKey === 'email') {
          return 'Invalid email format';
        }
        if (errorKey === 'maxlength') {
          return `Maximum length is ${control.errors[errorKey].requiredLength}`;
        }
        if (errorKey === 'minlength') {
          return `Minimum length is ${control.errors[errorKey].requiredLength}`;
        }
      }
    }
    return '';
  }
}
