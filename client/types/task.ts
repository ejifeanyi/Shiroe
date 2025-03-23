// src/types/task.ts

export enum TaskStatus {
	TODO = "todo",
	IN_PROGRESS = "in_progress",
	DONE = "done",
}

export enum TaskPriority {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
	URGENT = "urgent",
}

export interface Task {
	id: string;
	title: string;
	description?: string;
	status: TaskStatus;
	priority: TaskPriority;
	due_date?: string | Date;
	order: number;
	created_at: string;
	updated_at?: string;
	project_id: string;
	parent_task_id?: string;
	subtasks?: Task[];
}
