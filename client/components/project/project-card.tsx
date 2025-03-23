import { format } from "date-fns";
import {
	CalendarIcon,
	CheckCircle2Icon,
	CircleIcon,
	MoreVerticalIcon,
} from "lucide-react";

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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
	project: Project;
	onClick: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

export default function ProjectCard({
	project,
	onClick,
	onEdit,
	onDelete,
}: ProjectCardProps) {
	const completionPercentage =
		project.total_tasks && project.total_tasks > 0
			? Math.round(((project.completed_tasks || 0) * 100) / project.total_tasks)
			: 0;

	const hasDeadline = !!project.deadline;
	const deadlineDate = hasDeadline ? new Date(project.deadline!) : null;
	const isOverdue =
		hasDeadline && deadlineDate! < new Date() && completionPercentage < 100;

	const handleCardClick = (e: React.MouseEvent) => {
		// Prevent card click when clicking on dropdown
		if (!(e.target as HTMLElement).closest("[data-dropdown]")) {
			onClick();
		}
	};

	return (
		<Card
			className="hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col group relative"
			onClick={handleCardClick}
		>
			<div
				className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
				data-dropdown
			>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="h-8 w-8">
							<MoreVerticalIcon size={16} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
						<DropdownMenuItem
							onClick={onDelete}
							className="text-destructive focus:text-destructive"
						>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<CardHeader className="pb-3 cursor-pointer">
				<CardTitle className="truncate">{project.name}</CardTitle>
			</CardHeader>
			<CardContent className="flex-grow pb-3 cursor-pointer">
				{project.description ? (
					<p className="text-muted-foreground text-sm line-clamp-2">
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
			<CardFooter className="pt-0 flex flex-wrap gap-2 cursor-pointer">
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
