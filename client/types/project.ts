// types/project.ts
export interface Project {
	id: string;
	name: string;
	description?: string;
	deadline?: string;
	owner_id: string;
	created_at: string;
	updated_at?: string;
	total_tasks?: number;
	completed_tasks?: number;
}

export interface ProjectCreate {
	name: string;
	description?: string;
	deadline?: string;
}
