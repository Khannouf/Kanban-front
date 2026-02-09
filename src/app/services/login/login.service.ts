import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '../../models/user.model';
import { Observable, tap } from 'rxjs';

export interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class Login {
  private http = inject(HttpClient);
  private BASE_URL = '/api';

  user = signal<User | null | undefined>(undefined);

  constructor() {
    // Vérifier si un token existe au démarrage
    const token = localStorage.getItem('token');
    if (token) {
      this.getCurrentUser().subscribe({
        error: () => {
          // Si le token est invalide, le supprimer
          localStorage.removeItem('token');
          this.user.set(null);
        }
      });
    }
  }

  login(credentials: LoginCredentials): Observable<User> {
    return this.http.post(this.BASE_URL + '/users/login', credentials).pipe(tap((result: any) => {
      localStorage.setItem('token', result.token);
    }));
  }

  getCurrentUser() {
    return this.http.get(this.BASE_URL + '/users/profile').pipe(
      tap((result: any) => {
        const user = Object.assign(new User(), result.data);
        this.user.set(user);
      }))
  }

  logout(): void {
    localStorage.removeItem('token');
    this.user.set(null);
  }

}
