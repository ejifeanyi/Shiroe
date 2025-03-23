import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/task";
import TaskCard from "./task-card";

interface SortableTaskProps {
	task: Task;
	onEdit: () => void;
	onDelete: () => void;
}

export default function SortableTask({
	task,
	onEdit,
	onDelete,
}: SortableTaskProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: task.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="mb-3 touch-manipulation"
		>
			<TaskCard
				task={task}
				onEdit={onEdit}
				onDelete={onDelete}
				isDragging={isDragging}
			/>
		</div>
	);
}
