// components/dashboard/TaskList.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task, TaskPriority, TaskStatus } from "@/types/dashboard";
import { format } from "date-fns";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";

interface TaskListProps {
	title: string;
	tasks: Task[];
	emptyMessage: string;
	variant?: "default" | "destructive";
}

export default function TaskList({
	title,
	tasks,
	emptyMessage,
	variant = "default",
}: TaskListProps) {
	// Function to determine task status icon
	const getStatusIcon = (status: TaskStatus) => {
		switch (status) {
			case TaskStatus.DONE:
				return <CheckCircle2 className="h-4 w-4 text-green-500" />;
			case TaskStatus.IN_PROGRESS:
				return <Clock className="h-4 w-4 text-blue-500" />;
			case TaskStatus.REVIEW:
				return <AlertCircle className="h-4 w-4 text-yellow-500" />;
			default:
				return <Circle className="h-4 w-4 text-gray-400" />;
		}
	};

	// Function to determine priority badge variant
	const getPriorityVariant = (priority: TaskPriority) => {
		switch (priority) {
			case TaskPriority.URGENT:
				return "destructive";
			case TaskPriority.HIGH:
				return "outline";
			case TaskPriority.MEDIUM:
				return "secondary";
			default:
				return "default";
		}
	};

	return (
		<Card className={variant === "destructive" ? "border-red-300" : ""}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				{tasks.length > 0 ? (
					<div className="space-y-4">
						{tasks.map((task) => (
							<div
								key={task.id}
								className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
							>
								<div className="flex items-start gap-3">
									<div className="mt-1">{getStatusIcon(task.status)}</div>
									<div>
										<h4 className="font-medium">{task.title}</h4>
										{task.description && (
											<p className="text-sm text-muted-foreground line-clamp-1">
												{task.description}
											</p>
										)}
										<div className="mt-1 text-xs text-muted-foreground">
											Due: {format(new Date(task.due_date), "MMM d, yyyy")}
										</div>
									</div>
								</div>
								<Badge variant={getPriorityVariant(task.priority)}>
									{task.priority}
								</Badge>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-6">
						<p className="text-muted-foreground">{emptyMessage}</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
