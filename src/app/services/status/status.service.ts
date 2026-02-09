import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs/internal/operators/tap';
import { Status } from '../../models/status.model';

interface CreateStatusCredentials {
  name: string;
  color: string;
}

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private http = inject(HttpClient);
  private BASE_URL = '/api';

  status = signal<Status[] | null | undefined>(undefined);

  constructor() {}

  getStatus() {
    return this.http.get(this.BASE_URL + '/status').pipe(
      tap((result: any) => {
        this.status.set(result.data);
        console.log("StatusService : ", result.data);
      }),
    );
  }

  createStatus(credentials: CreateStatusCredentials) {
    return this.http.post(this.BASE_URL + '/status', credentials).pipe(
      tap((result: any) => {
        const newStatus = result.data as Status;
        const currentStatus = this.status() || [];
        this.status.set([...currentStatus, newStatus]);
        console.log("Status created : ", result.data);
      })
    )
  }

  updateStatus(credentials: Status) {
    return this.http.patch(`${this.BASE_URL}/status/${credentials._id}`, credentials).pipe(
      tap((result: any) => {
        const updatedStatus = result.data as Status;
        const currentStatus = this.status() || [];
        this.status.set(
          currentStatus.map((s) => (s._id === updatedStatus._id ? updatedStatus : s))
        );
        console.log("Status updated : ", updatedStatus);
      })
    );
  }

  deleteStatus(statusId: string) {
    return this.http.delete(`${this.BASE_URL}/status/${statusId}`).pipe(
      tap(() => {
        const currentStatus = this.status() || [];
        this.status.set(currentStatus.filter(s => s._id !== statusId));
        console.log("Status deleted:", statusId);
      })
    );
  }
}
