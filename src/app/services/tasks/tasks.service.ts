import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { TaskModel } from '../../models/task.model';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateTask {
  name: string;
  description: string;
  statusId: string;
  priority: string;
  tags: string[];
}

@Injectable({
  providedIn: 'root',
})
export class TasksService {

  private http = inject(HttpClient)
  private readonly apiUrl = environment.apiUrl;

  constructor() { }

  task = signal<TaskModel[] | null | undefined>(undefined);

  getTasksByStatus(statusId: string) {
  return computed(() => {
    return (this.task() || []).filter(t => t.statusId === statusId);
  });
}

  createTask(credentials: CreateTask) {
    return this.http.post(this.apiUrl + '/tasks', credentials).pipe(
      tap((result: any) => {
        const newTask = result.data as TaskModel;
        const currentTasks = this.task() || [];
        this.task.set([...currentTasks, newTask]);
        console.log("Task created : ", result.data);
      })
    )
  }

  updateTaskStatus(taskId: string, statusId: string) {
    return this.http.patch(`${this.apiUrl}/tasks/${taskId}`, { statusId: statusId }).subscribe(
      (response) => {
        console.log('Statut mis à jour:', response);
      },
      (error) => {
        console.error('Erreur lors de la mise à jour:', error);
      }
    );
  }

  updateTask(taskId: string, credentials: CreateTask) {
    return this.http.patch(`${this.apiUrl}/tasks/${taskId}`, credentials).pipe(
      tap((result: any) => {
        const updatedTask = result.data as TaskModel;
        const currentTasks = this.task() || [];
        const taskIndex = currentTasks.findIndex(t => t._id === taskId);
        if (taskIndex !== -1) {
          currentTasks[taskIndex] = updatedTask;
          this.task.set([...currentTasks]);
          console.log("Task updated : ", result.data);
        }
      })
    )
  }

  deleteTask(taskId: string) {
    return this.http.delete(`${this.apiUrl}/tasks/${taskId}`).pipe(
      tap((result: any) => {
        const currentTasks = this.task() || [];
        const updatedTasks = currentTasks.filter(t => t._id !== taskId);
        this.task.set(updatedTasks);
        console.log("Task deleted : ", result.data.message)
      })
    )
  }

  getTasks() {
    return this.http.get(this.apiUrl + '/tasks').pipe(
      tap((result: any) => {
        this.task.set(result.data);
        console.log("TasksService : ", result.data);
      })
    )
  }
  
}
