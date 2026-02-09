export enum Priority {
  LOW = "faible",
  MEDIUM = "modérée",
  HIGH = "élevée",
  URGENT = "urgent"
}


export class TaskModel {
  _id: string = '';
  name: string = '';
  description: string = '';
  statusId: string = '';
  order: number = 0;
  priority: Priority = Priority.MEDIUM;
  tags: string[] = [];
}