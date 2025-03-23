// components/projects/ProjectCard.tsx
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2Icon, CircleIcon } from "lucide-react";

import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ProjectCardProps {
	project: Project;
	onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
	const completionPercentage =
		project.total_tasks && project.total_tasks > 0
			? Math.round(((project.completed_tasks || 0) * 100) / project.total_tasks)
			: 0;

	const hasDeadline = !!project.deadline;
	const deadlineDate = hasDeadline ? new Date(project.deadline!) : null;
	const isOverdue =
		hasDeadline && deadlineDate! < new Date() && completionPercentage < 100;

	return (
		<Card
			className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col"
			onClick={onClick}
		>
			<CardHeader className="pb-3">
				<CardTitle className="truncate">{project.name}</CardTitle>
			</CardHeader>
			<CardContent className="flex-grow pb-3">
				{project.description ? (
					<p className="text-muted-foreground text-sm line-clamp-2 truncate">
						{project.description}
					</p>
				) : (
					<p className="text-muted-foreground text-sm italic">No description</p>
				)}

				<div className="mt-4">
					<div className="flex justify-between items-center mb-1 text-sm">
						<span>{completionPercentage}% Complete</span>
						<span className="text-muted-foreground">
							{project.completed_tasks || 0} / {project.total_tasks || 0} tasks
						</span>
					</div>
					<Progress value={completionPercentage} className="h-2" />
				</div>
			</CardContent>
			<CardFooter className="pt-0 flex flex-wrap gap-2">
				{hasDeadline && (
					<Badge
						variant={isOverdue ? "destructive" : "secondary"}
						className="flex items-center gap-1"
					>
						<CalendarIcon size={12} />
						{format(deadlineDate!, "MMM d, yyyy")}
					</Badge>
				)}

				{project.total_tasks === 0 ? (
					<Badge variant="outline" className="flex items-center gap-1">
						<CircleIcon size={12} />
						No tasks
					</Badge>
				) : completionPercentage === 100 ? (
					<Badge
						variant="default"
						className="flex items-center gap-1 bg-green-600"
					>
						<CheckCircle2Icon size={12} />
						Completed
					</Badge>
				) : null}
			</CardFooter>
		</Card>
	);
}
