// types/dashboard.ts
export enum TaskStatus {
	TODO = "todo",
	IN_PROGRESS = "in_progress",
	REVIEW = "review",
	DONE = "done",
}

export enum TaskPriority {
	URGENT = "urgent",
	HIGH = "high",
	MEDIUM = "medium",
	LOW = "low",
}

export interface Task {
	id: string;
	title: string;
	description?: string;
	status: TaskStatus;
	priority: TaskPriority;
	due_date: string;
	created_at: string;
	updated_at: string;
	project_id: string;
}

export interface Project {
	id: string;
	name: string;
	description?: string;
	task_count: number;
	color?: string;
}

export interface DashboardStats {
	total_projects: number;
	total_tasks: number;
	completed_tasks: number;
	completion_rate: number;
}

export interface DashboardData {
	recent_projects: Project[];
	today_tasks: Task[];
	overdue_tasks: Task[];
	upcoming_tasks: Task[];
	stats: DashboardStats;
}

export interface PriorityDistribution {
	urgent: number;
	high: number;
	medium: number;
	low: number;
}

export interface AnalyticsData {
	period_days: number;
	completed_tasks: number;
	created_tasks: number;
	completion_rate: number;
	priority_distribution: PriorityDistribution;
}
