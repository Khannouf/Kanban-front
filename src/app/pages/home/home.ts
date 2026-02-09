import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Login } from '../../services/login/login.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home{
  private readonly loginService = inject(Login);
  readonly user = this.loginService.user;

  logout(): void {
    localStorage.removeItem('token');
    this.user.set(null);
  }

}
