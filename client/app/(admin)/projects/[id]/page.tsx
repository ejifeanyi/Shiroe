"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
	ArrowLeftIcon,
	CalendarIcon,
	PencilIcon,
	Trash2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Project } from "@/types/project";
import { format } from "date-fns";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ProjectDetailPage() {
	const params = useParams();
	const router = useRouter();
	const [project, setProject] = useState<Project | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const projectId = params.id as string;

	useEffect(() => {
		if (projectId) {
			fetchProject(projectId);
		}
	}, [projectId]);

	const fetchProject = async (id: string) => {
		setIsLoading(true);
		try {
			const token = Cookies.get("token");
			if (!token) {
				router.push("/login");
				return;
			}

			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setProject(response.data);
		} catch (error) {
			console.error("Failed to fetch project:", error);
			toast("Failed to load project details. Please try again.");
			router.push("/projects");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const token = Cookies.get("token");
			await axios.delete(
				`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			toast(
				"Project deleted successfully");
			router.push("/projects");
		} catch (error) {
			console.error("Failed to delete project:", error);
			toast( "Failed to delete project. Please try again.");
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
		}
	};

	return (
		<div className="container mx-auto py-8 px-4">
			<Button
				variant="ghost"
				className="mb-6 flex items-center gap-2"
				onClick={() => router.push("/projects")}
			>
				<ArrowLeftIcon size={16} />
				Back to Projects
			</Button>

			{isLoading ? (
				<div className="space-y-4">
					<Skeleton className="h-10 w-3/4" />
					<Skeleton className="h-6 w-1/2" />
					<Skeleton className="h-32 w-full" />
				</div>
			) : project ? (
				<div className="space-y-8">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<h1 className="text-3xl font-bold">{project.name}</h1>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								className="flex items-center gap-2"
								onClick={() => router.push(`/projects/${projectId}/edit`)}
							>
								<PencilIcon size={14} />
								Edit
							</Button>
							<Button
								variant="destructive"
								size="sm"
								className="flex items-center gap-2"
								onClick={() => setIsDeleteDialogOpen(true)}
							>
								<Trash2Icon size={14} />
								Delete
							</Button>
						</div>
					</div>

					{project.deadline && (
						<div className="flex items-center gap-2">
							<Badge className="flex items-center gap-1">
								<CalendarIcon size={12} />
								Deadline: {format(new Date(project.deadline), "MMMM d, yyyy")}
							</Badge>
						</div>
					)}

					<div className="bg-card p-6 rounded-lg border">
						<h2 className="text-lg font-medium mb-2">Description</h2>
						{project.description ? (
							<p className="text-muted-foreground whitespace-pre-line">
								{project.description}
							</p>
						) : (
							<p className="text-muted-foreground italic">
								No description provided
							</p>
						)}
					</div>

					<div className="bg-card p-6 rounded-lg border">
						<h2 className="text-lg font-medium mb-4">Tasks</h2>
						<p className="text-muted-foreground">
							Task management functionality coming soon...
						</p>
						{/* Task list component would go here */}
					</div>
				</div>
			) : (
				<div className="py-12 text-center">
					<h2 className="text-xl font-medium">Project not found</h2>
					<p className="text-muted-foreground mt-2">
						The project you&apos;re looking for doesn&apos;t exist or you
						don&apos;t have access to it.
					</p>
				</div>
			)}

			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							project and all associated tasks.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
