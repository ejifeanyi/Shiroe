import { useState } from "react";
import { format } from "date-fns";
import { Task, TaskPriority } from "@/types/task";
import { CalendarIcon, GripVerticalIcon, MoreVerticalIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TaskCardProps {
	task: Task;
	onEdit: () => void;
	onDelete: () => void;
	isDragging?: boolean;
}

export default function TaskCard({
	task,
	onEdit,
	onDelete,
	isDragging,
}: TaskCardProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// Get priority-based styles with dark mode support
	const getPriorityStyles = (priority: TaskPriority) => {
		switch (priority) {
			case "urgent":
				return {
					borderColor: "border-red-500 dark:border-red-700",
					badgeColor:
						"bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/50",
					icon: "text-red-500 dark:text-red-400",
				};
			case "high":
				return {
					borderColor: "border-orange-400 dark:border-orange-600",
					badgeColor:
						"bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-950/50",
					icon: "text-orange-400 dark:text-orange-300",
				};
			case "medium":
				return {
					borderColor: "border-blue-400 dark:border-blue-600",
					badgeColor:
						"bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/50",
					icon: "text-blue-400 dark:text-blue-300",
				};
			case "low":
				return {
					borderColor: "border-green-400 dark:border-green-600",
					badgeColor:
						"bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-950/50",
					icon: "text-green-400 dark:text-green-300",
				};
			default:
				return {
					borderColor: "border-slate-200 dark:border-slate-700",
					badgeColor:
						"bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
					icon: "text-slate-400 dark:text-slate-500",
				};
		}
	};

	const { borderColor, badgeColor, icon } = getPriorityStyles(task.priority);

	return (
		<div
			className={cn(
				`bg-white dark:bg-slate-800 rounded-lg shadow-sm p-3 border-l-4 ${borderColor} transition-all`,
				isDragging
					? "shadow-md opacity-70 rotate-1 scale-105"
					: "hover:shadow-md"
			)}
		>
			<div className="flex justify-between items-start gap-2">
				<div className="flex items-start gap-2">
					<GripVerticalIcon
						size={16}
						className="mt-1 text-gray-400 dark:text-gray-500 cursor-grab"
					/>
					<h4 className="font-medium text-sm leading-tight mb-1 text-gray-900 dark:text-gray-100">
						{task.title}
					</h4>
				</div>
				<DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-1">
							<MoreVerticalIcon size={16} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
						<DropdownMenuItem
							className="text-red-600 dark:text-red-400"
							onClick={() => {
								setIsMenuOpen(false);
								onDelete();
							}}
						>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{task.description && (
				<p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2 ml-6">
					{task.description}
				</p>
			)}

			<div className="flex flex-wrap items-center gap-2 mt-2 ml-6">
				<Badge variant="secondary" className={badgeColor}>
					{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
				</Badge>

				{task.due_date && (
					<div className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
						<CalendarIcon size={12} className={icon} />
						{format(new Date(task.due_date), "MMM d")}
					</div>
				)}
			</div>
		</div>
	);
}
