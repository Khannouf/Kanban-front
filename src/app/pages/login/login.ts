import { Component, inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from '../../validators/custom.validators';
import {LoginCredentials, Login as LoginService} from '../../services/login/login.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnDestroy{
  private loginService = inject(LoginService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  //private loginSubscription:Subscription | null = null;
  //private userSubscription: Subscription | null = null;

  private subscriptions = new Subscription();

  form = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6), CustomValidators.strongPassword()],
    }),
  });
  isLoading:boolean = false;
  errorMessage:string = '';

  login() {
    this.isLoading = true;
    this.errorMessage = '';
    const loginSubscription = this.loginService.login(
        this.form.getRawValue() as LoginCredentials
      ).subscribe({
        next: () => {
          this.toastr.success('Connexion réussie', 'Succès');
          this.getUserInformations();
        },
        error: (err) => {
          console.error("Error fetching user profile:", err);
          this.errorMessage = 'Erreur lors de la récupération du profil utilisateur';
          this.toastr.error('Identifiants invalides', 'Erreur');
          this.isLoading = false;
        }
      });
      this.subscriptions.add(loginSubscription);
  }

  getUserInformations () {
    const getUserSubscription = this.loginService.getCurrentUser().subscribe(user =>{
      this.router.navigate(['/home']);
    })
    this.subscriptions.add(getUserSubscription);
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    const emailControl = this.form.get('email');
    const passwordControl = this.form.get('password');
    if (emailControl?.hasError('email')) {
      console.error('Erreur email invalide:', emailControl.value);
      this.errorMessage = 'Format d\'email invalide';
      this.isLoading = false;
      return;
    } 
    if (passwordControl?.hasError('strongPassword')) {
      console.error('Erreur mot de passe faible:', passwordControl.value);
      this.errorMessage = "Le mot de passe ne respecte pas le format requis";
      this.isLoading = false;
      return; 
    }
    if (this.form.valid) {
      this.login();
    }
  }

  ngOnDestroy(): void {
      this.subscriptions.unsubscribe();
  }
}
