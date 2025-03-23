// app/projects/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";
import { toast } from "sonner";
import ProjectCard from "@/components/project/project-card";
import CreateProjectModal from "@/components/project/create-project-modal";

export default function ProjectsPage() {
	const router = useRouter();
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		fetchProjects();
	}, []);

	const fetchProjects = async () => {
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
	};

	const handleCreateSuccess = (newProject: Project) => {
		setIsModalOpen(false);
		toast("Project created successfully!");
		router.push(`/projects/${newProject.id}`);
	};

	return (
		<div className="container mx-auto py-8 px-4">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">My Projects</h1>
				<Button
					onClick={() => setIsModalOpen(true)}
					className="flex items-center gap-2"
				>
					<PlusIcon size={16} />
					Create Project
				</Button>
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
					<Button
						onClick={() => setIsModalOpen(true)}
						className="flex items-center gap-2"
					>
						<PlusIcon size={16} />
						Create Your First Project
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{projects.map((project) => (
						<ProjectCard
							key={project.id}
							project={project}
							onClick={() => router.push(`/projects/${project.id}`)}
						/>
					))}
				</div>
			)}

			<CreateProjectModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSuccess={handleCreateSuccess}
			/>
		</div>
	);
}
