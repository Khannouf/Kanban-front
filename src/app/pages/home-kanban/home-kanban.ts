import { Component, inject, ViewChild } from '@angular/core';
import { Login } from '../../services/login/login.service';
import { MatIconModule } from '@angular/material/icon';
  import { MatSidenavModule } from '@angular/material/sidenav';
import { StatusService } from '../../services/status/status.service';
import { Status } from '../../components/status/status';
import { RouterLink } from '@angular/router';
import { Tasks } from '../../components/tasks/tasks';
import { TaskModel } from '../../models/task.model';

@Component({
  selector: 'app-home-kanban',
  imports: [RouterLink, MatIconModule, MatSidenavModule, Status, Tasks],
  templateUrl: './home-kanban.html',
  styleUrl: './home-kanban.css',
})
export class HomeKanban {
  @ViewChild(Tasks) tasksComponent!: Tasks;

  private readonly loginService = inject(Login);
  readonly user = this.loginService.user;
  private statusService = inject(StatusService);
  
  logout (): void {
    localStorage.removeItem("token");
    this.user.set(null);
  }
  isTaskModalOpen = false;
  openTaskModal() {
    this.isTaskModalOpen = true;
  }
  closeTaskModal() {
    this.isTaskModalOpen = false;
  }
  isCatModalOpen = false;
  openCatModal() {
    this.isCatModalOpen = true;
  }
  closeCatModal() {
    this.isCatModalOpen = false;
  }
  
  onEditTask(task: TaskModel): void {
    queueMicrotask(() => this.tasksComponent.modalUpdateTask(task));
  }
}
