import { useDroppable } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { Task, TaskStatus } from "@/types/task";
import SortableTask from "./sortable-task";

interface TaskColumnProps {
	id: TaskStatus;
	title: string;
	tasks: Task[];
	color: string;
	activeId: string | null;
	onTaskEdit: (task: Task) => void;
	onTaskDelete: (taskId: string) => void;
}

export default function TaskColumn({
	id,
	title,
	tasks,
	onTaskEdit,
	onTaskDelete,
}: TaskColumnProps) {
	const { setNodeRef } = useDroppable({
		id,
	});

	// Dark mode friendly column colors
	const columnColors = {
		todo: {
			light: "bg-slate-50",
			dark: "dark:bg-slate-900",
		},
		in_progress: {
			light: "bg-blue-50",
			dark: "dark:bg-blue-950/30",
		},
		done: {
			light: "bg-green-50",
			dark: "dark:bg-green-950/30",
		},
	};

	// Get the appropriate column colors based on the id
	const columnColor = columnColors[id] || {
		light: "bg-slate-50",
		dark: "dark:bg-slate-900",
	};

	return (
		<div
			className={`rounded-lg border ${columnColor.light} ${columnColor.dark} p-4 h-full transition-colors duration-200`}
		>
			<h3 className="font-medium text-lg mb-4 flex justify-between items-center">
				{title}
				<Badge variant="secondary" className="ml-2">
					{tasks.length}
				</Badge>
			</h3>
			<div ref={setNodeRef} className="min-h-[calc(100vh-14rem)]">
				<SortableContext
					items={tasks.map((task) => task.id)}
					strategy={verticalListSortingStrategy}
				>
					{tasks.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg dark:border-slate-700">
							No tasks
						</div>
					) : (
						tasks.map((task) => (
							<SortableTask
								key={task.id}
								task={task}
								onEdit={() => onTaskEdit(task)}
								onDelete={() => onTaskDelete(task.id)}
							/>
						))
					)}
				</SortableContext>
			</div>
		</div>
	);
}
