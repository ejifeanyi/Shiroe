// components/projects/UpdateProjectModal.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Project, ProjectCreate } from "@/types/project";
import { toast } from "sonner";

interface UpdateProjectModalProps {
	project: Project | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: (project: Project) => void;
}

export default function UpdateProjectModal({
	project,
	isOpen,
	onClose,
	onSuccess,
}: UpdateProjectModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<ProjectCreate>({
		name: "",
		description: "",
	});
	const [date, setDate] = useState<Date | undefined>(undefined);

	useEffect(() => {
		if (project) {
			setFormData({
				name: project.name,
			});
			setDate(project.deadline ? new Date(project.deadline) : undefined);
		}
	}, [project]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.name.trim()) {
			toast("No name.");
			return;
		}

		if (!project) return;
		setIsLoading(true);

		try {
			const token = Cookies.get("token");
			if (!token) {
				toast("You must be logged in to update a project");
				return;
			}

			const projectData: ProjectCreate = {
				...formData,
				deadline: date ? date.toISOString() : undefined,
			};

			const response = await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/projects/${project.id}`,
				projectData,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			onSuccess(response.data);
			toast("Project updated successfully.");
		} catch (error) {
			console.error("Error updating project:", error);
			toast("Failed to update project. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Update Project</DialogTitle>
						<DialogDescription>
							Make changes to your project details.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-6 py-4">
						<div className="grid gap-2">
							<Label htmlFor="name" className="required">
								Project Name
							</Label>
							<Input
								id="name"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								placeholder="Enter project name"
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="description">Description</Label>
							<Textarea
								id="description"
								name="description"
								value={formData.description || ""}
								onChange={handleInputChange}
								placeholder="Add a brief description of your project"
								rows={3}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="deadline">Deadline (optional)</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className="w-full justify-start text-left font-normal"
										id="deadline"
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{date ? format(date, "PPP") : "Select a deadline"}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={date}
										onSelect={setDate}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							{date && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="mt-1 text-muted-foreground"
									onClick={() => setDate(undefined)}
								>
									Clear deadline
								</Button>
							)}
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Saving..." : "Save Changes"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
