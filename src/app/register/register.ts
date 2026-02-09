import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomValidators } from '../validators/custom.validators';
import { Subscription } from 'rxjs';
import { RegisterCredentials, Register as RegisterService } from '../services/register/register.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register{
  private router = inject(Router);
  private registerService = inject(RegisterService);
  private toastr = inject(ToastrService);
  private registerSubscription: Subscription | null = null;

  registerFormGroup = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('',{
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6), CustomValidators.strongPassword()],
    }),
  });
  isLoading = false;
  isError = '';
  errorMessage = '';

  onSubmit() {
    this.errorMessage = '';
    
    // Vérifier les erreurs
    const errors: string[] = [];
    
    if (this.registerFormGroup.get('name')?.hasError('required')) {
      errors.push('Le nom est requis');
    }
    
    if (this.registerFormGroup.get('email')?.hasError('required')) {
      errors.push('L\'email est requis');
    } else if (this.registerFormGroup.get('email')?.hasError('email')) {
      errors.push('L\'email est invalide');
    }
    
    if (this.registerFormGroup.get('password')?.hasError('required')) {
      errors.push('Le mot de passe est requis');
    } else if (this.registerFormGroup.get('password')?.hasError('minlength')) {
      errors.push('Le mot de passe doit avoir au moins 6 caractères');
    } else if (this.registerFormGroup.get('password')?.hasError('strongPassword')) {
      errors.push('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial');
    }
    
    if (errors.length > 0) {
      this.errorMessage = errors.join(' | ');
      return;
    }
    
    this.isLoading = true;
    if (this.registerFormGroup.valid) {
      console.log('Registration data:', this.registerFormGroup.getRawValue());
      this.registerSubscription = this.registerService.register(
        this.registerFormGroup.value as RegisterCredentials,
      ).subscribe({
        next: () => {
          this.toastr.success('Inscription réussie', 'Succès');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          // Extraire le message d'erreur du backend
          if (err.error?.message) {
            // Message du backend
            if (err.error.message.includes('E11000')) {
              this.errorMessage = 'Cet email est déjà utilisé. Veuillez en choisir un autre.';
            } else {
              this.errorMessage = err.error.message;
            }
          } else {
            this.errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
          }
          this.toastr.error(this.errorMessage, 'Erreur');
          this.isLoading = false;
          console.error('Registration error:', err);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
