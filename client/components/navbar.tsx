"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

import PriorityTasksButton from "./priority-task-button";
import CreateProjectButton from "./create-project-button";
import CreateProjectModal from "./project/create-project-modal";

import { Project } from "@/types/project";

const Navbar: React.FC = () => {
	const router = useRouter();
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const handleCreateSuccess = (newProject: Project) => {
		setIsCreateModalOpen(false);
		toast("Project created successfully!");
		router.push(`/projects/${newProject.id}`);
	};

	return (
		<>
			<header className="sticky top-0 z-40 border-b bg-background">
				<div className="flex items-center justify-between h-16 px-6 py-4">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search..."
							className="w-[400px] pl-8 bg-background"
						/>
					</div>

					<div className="flex items-center gap-4">
						<CreateProjectButton onClick={() => setIsCreateModalOpen(true)}>
							New Project
						</CreateProjectButton>
						<PriorityTasksButton />

						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.push("/profile")}
							aria-label="Go to profile"
						>
							<User className="h-5 w-5" />
						</Button>

						<ThemeToggle />
					</div>
				</div>
			</header>

			<CreateProjectModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSuccess={handleCreateSuccess}
			/>
		</>
	);
};

export default Navbar;
