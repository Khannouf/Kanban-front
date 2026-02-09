import { Component, inject, OnDestroy, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Login } from './services/login/login.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy{
  private readonly loginService = inject(Login);
  private router = inject(Router);

  readonly user = this.loginService.user;
  protected readonly title = signal('kanban');

  private logoutSubscription: Subscription | null = null;



  logout(): void {
    localStorage.removeItem('token');
    this.user.set(null);
    this.router.navigate(['/home']);
  }

  ngOnDestroy(): void {
      this.logoutSubscription?.unsubscribe();
  }
}
