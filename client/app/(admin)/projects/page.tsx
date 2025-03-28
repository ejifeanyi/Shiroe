// app/projects/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Project } from "@/types/project";
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
import ProjectCard from "@/components/project/project-card";
import UpdateProjectModal from "@/components/project/update-project-modal";
import CreateProjectModal from "@/components/project/create-project-modal";
import CreateProjectButton from "@/components/create-project-button";

export default function ProjectsPage() {
	const router = useRouter();
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const fetchProjects = useCallback(async () => {
		setIsLoading(true);
		try {
			const token = Cookies.get("token");
			if (!token) {
				router.push("/login");
				return;
			}

			const response = await axios.get(
				`${process.env.NEXT_PUBLIC_API_URL}/projects`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setProjects(response.data);
		} catch (error) {
			console.error("Failed to fetch projects:", error);
			toast("Failed to load projects. Please try again.");
		} finally {
			setIsLoading(false);
		}
	}, [router]);

	useEffect(() => {
		fetchProjects();
	}, [fetchProjects]);

	const handleCreateSuccess = (newProject: Project) => {
		setIsCreateModalOpen(false);
		toast("Project created successfully!");
		router.push(`/projects/${newProject.id}`);
	};

	const handleUpdateSuccess = (updatedProject: Project) => {
		setIsUpdateModalOpen(false);
		setProjects(
			projects.map((p) => (p.id === updatedProject.id ? updatedProject : p))
		);
	};

	const handleEditProject = (project: Project) => {
		setSelectedProject(project);
		setIsUpdateModalOpen(true);
	};

	const handleDeleteConfirm = (project: Project) => {
		setSelectedProject(project);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteProject = async () => {
		if (!selectedProject) return;

		setIsDeleting(true);
		try {
			const token = Cookies.get("token");
			await axios.delete(
				`${process.env.NEXT_PUBLIC_API_URL}/projects/${selectedProject.id}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setProjects(projects.filter((p) => p.id !== selectedProject.id));
			toast("Project deleted successfully");
		} catch (error) {
			console.error("Failed to delete project:", error);
			toast("Failed to delete project. Please try again.");
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
		}
	};

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">My Projects</h1>
				<CreateProjectButton onClick={() => setIsCreateModalOpen(true)}>
					New Project
				</CreateProjectButton>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(3)].map((_, index) => (
						<div
							key={index}
							className="h-40 rounded-lg bg-muted animate-pulse"
						/>
					))}
				</div>
			) : projects.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-12 text-center">
					<h2 className="text-xl font-medium mb-2">No projects yet</h2>
					<p className="text-muted-foreground mb-6 max-w-md">
						Create your first project to get started organizing your tasks
					</p>
					<CreateProjectButton
						onClick={() => setIsCreateModalOpen(true)}
						className="flex items-center gap-2"
					>
						New Project
					</CreateProjectButton>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{projects.map((project) => (
						<ProjectCard
							key={project.id}
							project={project}
							onClick={() => router.push(`/projects/${project.id}`)}
							onEdit={() => handleEditProject(project)}
							onDelete={() => handleDeleteConfirm(project)}
						/>
					))}
				</div>
			)}

			<CreateProjectModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSuccess={handleCreateSuccess}
			/>

			<UpdateProjectModal
				project={selectedProject}
				isOpen={isUpdateModalOpen}
				onClose={() => setIsUpdateModalOpen(false)}
				onSuccess={handleUpdateSuccess}
			/>

			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							project
							{selectedProject && ` "${selectedProject.name}"`} and all
							associated tasks.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteProject}
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
