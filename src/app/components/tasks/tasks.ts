import { Component, computed, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Login } from '../../services/login/login.service';
import { TasksService } from '../../services/tasks/tasks.service';
import { StatusService } from '../../services/status/status.service';
import { Priority, TaskModel } from '../../models/task.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-tasks',
  imports: [ReactiveFormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks {
  private readonly loginService = inject(Login);
  readonly user = this.loginService.user();
  taskService = inject(TasksService);
  statusService = inject(StatusService);
  private toastr = inject(ToastrService);
  readonly tasks = this.taskService.task;
  taskWithouStatus = computed(() => {
    return this.tasks()?.filter((t) => !t.statusId);
  });
  readonly status = this.statusService.status;
  readonly sortedStatus = computed(() => {
    return this.status()?.sort((a, b) => a.order - b.order);
  });
  readonly priorities = Priority;
  readonly Object = Object;

  @Input() isTaskModalOpen = false;
  @Output() closeTaskModal = new EventEmitter<void>();

  isTaskUpdateModalOpen = signal(false);
  selectedTaskId: string | null = null;

  createTaskFormGroup = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', {
      nonNullable: false,
    }),
    status: new FormControl('', {
      nonNullable: false,
    }),
    priority: new FormControl('', {
      nonNullable: false,
    }),
    tags: new FormControl('', {
      nonNullable: false,
    }),
  });

  updateTaskFormGroup = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    description: new FormControl('', {
      nonNullable: false,
    }),
    status: new FormControl('', {
      nonNullable: false,
    }),
    priority: new FormControl('', {
      nonNullable: false,
    }),
    tags: new FormControl('', {
      nonNullable: false,
    }),
  });


  modalUpdateTask(item: TaskModel): void {
    this.isTaskUpdateModalOpen.set(true);
    this.selectedTaskId = item._id;
    this.updateTaskFormGroup.setValue({
      name: item.name,
      description: item.description,
      status: item.statusId,
      priority: item.priority,
      tags: item.tags.join(', '),
    })
  }

  deleteTask(itemId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.taskService.deleteTask(itemId).subscribe({
        next : () => {
          console.log('Tâche supprimée avec succès');
          this.toastr.success('Tâche supprimée avec succès', 'Succès');
          setTimeout(() => this.closeUpdateTaskModal());
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la tâche:', error);
          this.toastr.error('Erreur lors de la suppression de la tâche', 'Erreur');
        },
      })
    }
  }

  closeUpdateTaskModal(): void {
    this.isTaskUpdateModalOpen.set(false);
    this.selectedTaskId = null;
  }

  onUpdateSubmit(): void {
    if (!this.selectedTaskId || this.updateTaskFormGroup.invalid) {
      return;
    }
    const { name, description, status, priority, tags } = this.updateTaskFormGroup.getRawValue();
    const tagList = tags ? tags.split(',').map((tag) => tag.trim()) : [];
    this.taskService
      .updateTask(this.selectedTaskId, {
        name,
        description: description || '',
        statusId: status || '',
        priority: priority || '',
        tags: tagList,
      })
      .subscribe({
        next: (task) => {
          console.log('Tâche modifiée avec succès:', task);
          this.toastr.success('Tâche modifiée avec succès', 'Succès');
          this.closeUpdateTaskModal();
          this.updateTaskFormGroup.reset();
        },
        error: (error) => {
          console.error('Erreur lors de la modification de la tâche:', error);
          this.toastr.error('Erreur lors de la modification de la tâche', 'Erreur');
        },
      });
  }

  onSubmit() {
    if (this.createTaskFormGroup.valid) {
      const { name, description, status, priority, tags } = this.createTaskFormGroup.getRawValue();
      const tagList = tags ? tags.split(',').map((tag) => tag.trim()) : [];
      this.taskService
        .createTask({
          name,
          description: description || '',
          statusId: status || '',
          priority: priority || '',
          tags: tagList,
        })
        .subscribe({
          next: (task) => {
            console.log('Tâche créée avec succès:', task);
            this.toastr.success('Tâche créée avec succès', 'Succès');
            this.closeTaskModal.emit();
            this.createTaskFormGroup.reset();
          },
          error: (error) => {
            console.error('Erreur lors de la création de la tâche:', error);
            this.toastr.error('Erreur lors de la création de la tâche', 'Erreur');
          },
        });
    }
  }

  ngOnInit(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        console.log('Tâches récupérées avec succès:', tasks);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des tâches:', error);
        this.toastr.error('Erreur lors de la récupération des tâches', 'Erreur');
      },
    });
  }
}
