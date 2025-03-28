import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";

interface ProjectActionsDropdownProps {
	onEdit: () => void;
	onDelete: () => void;
}

const ProjectActionsDropdown: React.FC<ProjectActionsDropdownProps> = ({
	onEdit,
	onDelete,
}) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon">
					<MoreVerticalIcon size={16} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					className="flex items-center gap-2"
					onSelect={(e) => {
						e.preventDefault();
						onEdit();
					}}
				>
					<PencilIcon size={14} />
					Edit Project
				</DropdownMenuItem>
				<DropdownMenuItem
					className="flex items-center gap-2 text-destructive focus:text-destructive"
					onSelect={(e) => {
						e.preventDefault();
						onDelete();
					}}
				>
					<Trash2Icon size={14} />
					Delete Project
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ProjectActionsDropdown;
