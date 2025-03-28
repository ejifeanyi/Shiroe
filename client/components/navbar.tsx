"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

import { Search, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";

import PriorityTasksButton from "./priority-task-button";
import CreateProjectButton from "./create-project-button";
import CreateProjectModal from "./project/create-project-modal";

import { Project } from "@/types/project";

const Navbar: React.FC = () => {
	const router = useRouter();
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	const handleDateSelect = (date: Date | undefined) => {
		setSelectedDate(date);
		// TODO: Implement task fetching for the selected date
		console.log("Selected date:", date);
	};

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
						<Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
							<PopoverTrigger asChild>
								<Button variant="ghost" size="icon" aria-label="Open calendar">
									<Calendar className="h-5 w-5" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<CalendarComponent
									mode="single"
									selected={selectedDate}
									onSelect={(date) => {
										handleDateSelect(date);
										setIsCalendarOpen(false);
									}}
									className="rounded-md border shadow"
								/>
							</PopoverContent>
						</Popover>

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
