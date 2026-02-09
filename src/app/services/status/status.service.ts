import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs/internal/operators/tap';
import { Status } from '../../models/status.model';
import { environment } from '../../../environments/environment';

interface CreateStatusCredentials {
  name: string;
  color: string;
}

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  status = signal<Status[] | null | undefined>(undefined);

  constructor() {}

  getStatus() {
    return this.http.get(this.apiUrl + '/status').pipe(
      tap((result: any) => {
        this.status.set(result.data);
      }),
    );
  }

  createStatus(credentials: CreateStatusCredentials) {
    return this.http.post(this.apiUrl + '/status', credentials).pipe(
      tap((result: any) => {
        const newStatus = result.data as Status;
        const currentStatus = this.status() || [];
        this.status.set([...currentStatus, newStatus]);
      })
    )
  }

  updateStatus(credentials: Status) {
    return this.http.patch(`${this.apiUrl}/status/${credentials._id}`, credentials).pipe(
      tap((result: any) => {
        const updatedStatus = result.data as Status;
        const currentStatus = this.status() || [];
        this.status.set(
          currentStatus.map((s) => (s._id === updatedStatus._id ? updatedStatus : s))
        );
      })
    );
  }

  deleteStatus(statusId: string) {
    return this.http.delete(`${this.apiUrl}/status/${statusId}`).pipe(
      tap(() => {
        const currentStatus = this.status() || [];
        this.status.set(currentStatus.filter(s => s._id !== statusId));
      })
    );
  }
}
