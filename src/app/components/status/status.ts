import { Component, computed, EventEmitter, inject, Input, OnDestroy, Output, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Login } from '../../services/login/login.service';
import {  StatusService } from '../../services/status/status.service';
import { Status as StatusModel } from '../../models/status.model';
import { TaskModel } from '../../models/task.model';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TasksService } from '../../services/tasks/tasks.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-status',
  imports: [ReactiveFormsModule, ScrollingModule, MatIconModule, CommonModule, DragDropModule],
  templateUrl: './status.html',
  styleUrl: './status.css',
})
export class Status implements OnDestroy, AfterViewInit{
  @Input() isCatModalOpen = false;
  @Output() closeCatModal = new EventEmitter<void>();
  @Output() editTask = new EventEmitter<TaskModel>();

  private draggedTaskPreviousStatusId: string | null = null;


  private readonly loginService = inject(Login);
  readonly user = this.loginService.user;

  statusService = inject(StatusService);
  readonly status = this.statusService.status;
  readonly sortedStatus = computed(() => {
    return this.status()?.sort((a, b) => a.order - b.order)
  })
  tasksService = inject(TasksService);
  readonly tasks = this.tasksService.task;
  private toastr = inject(ToastrService);

  openUpdateStatusModal = false;
  selectedStatusId: string | null = null;

  openMenuId: string | null = null;

  StatusFormGroup = new FormGroup({
    name: new FormControl('', {
      nonNullable : true,
      validators: [Validators.required]
    }),
    color: new FormControl('#000000', {
      nonNullable: true,
      validators: [Validators.required]
    })
  })

  StatusUpdateformGroup = new FormGroup({
    name : new FormControl('', {
      nonNullable : true,
      validators: [Validators.required]
    }),
    color : new FormControl('#000000', {
      nonNullable : true,
      validators: [Validators.required]
    }),
    order : new FormControl(0, {
      nonNullable : true,
      validators: [Validators.required]
    })
  })

  toggleMenu(statusId: string): void {
    this.openMenuId = this.openMenuId === statusId ? null : statusId;
  }

  editStatus(item: any): void {
    console.log('Modifier status:', item);
    this.openMenuId = null;
    // TODO: Ajouter la logique de modification
  }

  modalUpdateStatus(item:  StatusModel): void {
    this.openUpdateStatusModal = true;
    this.selectedStatusId = item._id;
    this.StatusUpdateformGroup.setValue({
      name: item.name,
      color: item.color,
      order: item.order
    });
    console.log('Ouverture modal de mise à jour pour le status:', item);
  }

  closeUpdateModal(): void {
    this.openUpdateStatusModal = false;
    this.openMenuId = null;
  }

  updateStatus(): void {
    if (!this.selectedStatusId || this.StatusUpdateformGroup.invalid) {
      return;
    }
    const payload = {
      _id: this.selectedStatusId,
      ...this.StatusUpdateformGroup.getRawValue(),
    };
    this.statusService.updateStatus(payload).subscribe({
      next: () => {
        console.log('Status mis à jour avec succès');
        this.toastr.success('Statut mis à jour avec succès', 'Succès');
      },
      error: (err) => {
        console.error('Erreur mise à jour:', err);
        this.toastr.error('Erreur lors de la mise à jour du statut', 'Erreur');
      }
    })
    this.openUpdateStatusModal = false;
    this.selectedStatusId = null;
    this.openMenuId = null;
  }

  deleteStatus(statusId: string): void {
    console.log('Supprimer status:', statusId);
    this.statusService.deleteStatus(statusId).subscribe({
      next: () => {
        console.log('Status supprimé');
        this.toastr.success('Statut supprimé avec succès', 'Succès');
        this.openMenuId = null;
      },
      error: (err) => {
        console.error('Erreur suppression:', err);
        this.toastr.error('Erreur lors de la suppression du statut', 'Erreur');
      }
    });
  }

  onSubmit() {
    if (this.StatusFormGroup.valid){
      console.log('Status form submitted:', this.StatusFormGroup.value);
      this.statusService.createStatus(this.StatusFormGroup.getRawValue()).subscribe({
        next: () => {
          console.log("Status created successfully");
          this.toastr.success('Statut créé avec succès', 'Succès');
        },
        error: (err) => {
          console.error('Erreur création:', err);
          this.toastr.error('Erreur lors de la création du statut', 'Erreur');
        }
      });
      this.closeCatModal.emit();
    }
  }

  onDragStarted(task: TaskModel) {
    this.draggedTaskPreviousStatusId = task.statusId;
  }

  onTaskDrop(event: CdkDragDrop<TaskModel[] | null | undefined>, newStatusId: string) {
    if (!event.container.data) {
      return;
    }
    
    const task = event.item.data as TaskModel;
    
    if (!task) {
      return;
    }
    
    if (this.draggedTaskPreviousStatusId === newStatusId) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Mettre à jour le statusId de la tâche
      task.statusId = newStatusId;
      
      // Mettre à jour dans la base de données
      this.tasksService.updateTaskStatus(task._id, newStatusId);
    }
    
    // Réinitialiser
    this.draggedTaskPreviousStatusId = null;
  }

  

  ngOnInit(): void {
    this.statusService.getStatus().subscribe({
      next: (data) => {
        console.log('Status component' , data);
      },
      error: (err) => {
        console.error("Error fetching status:", err);
        this.toastr.error('Erreur lors de la récupération des statuts', 'Erreur');
      }
    });
  }

  ngAfterViewInit(): void {
    // Initialisation des zones de drop
  }

  getConnectedDropLists(): string[] {
    return this.sortedStatus()?.map(s => 'droplist-' + s._id) || [];
  }

  ngOnDestroy(): void {
    // Nettoyage si nécessaire
  }
  
}
