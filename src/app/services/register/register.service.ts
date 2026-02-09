import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { switchMap, tap } from 'rxjs';
import { Login } from '../login/login.service';

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class Register {
  constructor() {}
  private http = inject(HttpClient);
  private BASE_URL = '/api';
  private loginService = inject(Login);

  register(credentials: RegisterCredentials) {
    return this.http
      .post(this.BASE_URL + '/users/register', credentials)
      .pipe(
        switchMap(() =>
          this.loginService.login({ email: credentials.email, password: credentials.password }),
        ),
      );
  }
}
