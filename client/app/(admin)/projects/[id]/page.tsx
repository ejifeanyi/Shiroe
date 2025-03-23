"use client";

import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
	DndContext,
	closestCorners,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
	DragOverEvent,
	DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import {
	ArrowLeftIcon,
	CalendarIcon,
	PencilIcon,
	Trash2Icon,
	ClockIcon,
	PlusIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import UpdateProjectModal from "@/components/project/update-project-modal";
import { Task, TaskStatus } from "@/types/task";
import { Project } from "@/types/project";
import TaskModal from "@/components/task/task-model";
import TaskColumn from "@/components/task/task-column";

export default function ProjectTasksPage() {
	const params = useParams();
	const router = useRouter();
	const [project, setProject] = useState<Project | null>(null);
	const [tasks, setTasks] = useState<{ [key in TaskStatus]: Task[] }>({
		todo: [],
		in_progress: [],
		done: [],
	});
	const [activeId, setActiveId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const projectId = params.id as string;

	// Set up sensors for drag and drop
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const fetchProject = useCallback(
		async (id: string) => {
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
			}
		},
		[router]
	);

	const fetchTasks = useCallback(
		async (id: string) => {
			setIsLoading(true);
			try {
				const token = Cookies.get("token");
				if (!token) {
					router.push("/login");
					return;
				}

				const response = await axios.get(
					`${process.env.NEXT_PUBLIC_API_URL}/tasks?project_id=${id}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				// Group tasks by status
				const groupedTasks = {
					todo: [] as Task[],
					in_progress: [] as Task[],
					done: [] as Task[],
				};

				response.data.forEach((task: Task) => {
					groupedTasks[task.status].push(task);
				});

				// Sort tasks by order within each status
				Object.keys(groupedTasks).forEach((status) => {
					groupedTasks[status as TaskStatus].sort((a, b) => a.order - b.order);
				});

				setTasks(groupedTasks);
			} catch (error) {
				console.error("Failed to fetch tasks:", error);
				toast("Failed to load tasks. Please try again.");
			} finally {
				setIsLoading(false);
			}
		},
		[router]
	);

	useEffect(() => {
		if (projectId) {
			fetchProject(projectId);
			fetchTasks(projectId);
		}
	}, [projectId, fetchProject, fetchTasks]);

	const handleDeleteProject = async () => {
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

			toast("Project deleted successfully");
			router.push("/projects");
		} catch (error) {
			console.error("Failed to delete project:", error);
			toast("Failed to delete project. Please try again.");
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
		}
	};

	const handleUpdateProjectSuccess = (updatedProject: Project) => {
		setProject(updatedProject);
		setIsUpdateModalOpen(false);
		toast("Project updated successfully");
	};

	// Find the task that is being dragged
	const findTask = (id: string) => {
		for (const status in tasks) {
			const task = tasks[status as TaskStatus].find((task) => task.id === id);
			if (task) return task;
		}
		return null;
	};

	const findTaskContainer = (id: string): TaskStatus | null => {
		if (id in tasks) return id as TaskStatus;

		for (const status in tasks) {
			const taskIds = tasks[status as TaskStatus].map((task) => task.id);
			if (taskIds.includes(id)) return status as TaskStatus;
		}

		return null;
	};

	const handleDragStart = (event: DragStartEvent) => {
		const { active } = event;
		setActiveId(active.id as string);
	};

	const handleDragOver = (event: DragOverEvent) => {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		// Find the containers
		const activeContainer = findTaskContainer(activeId);
		const overContainer = findTaskContainer(overId);

		if (
			!activeContainer ||
			!overContainer ||
			activeContainer === overContainer
		) {
			return;
		}

		setTasks((prev) => {
			const activeItems = prev[activeContainer];
			const overItems = prev[overContainer];

			// Find the indexes
			const activeIndex = activeItems.findIndex((item) => item.id === activeId);
			const overIndex = overItems.findIndex((item) => item.id === overId);

			let newIndex: number;
			if (overId in prev) {
				// We're at the root droppable of a container
				newIndex = overItems.length;
			} else {
				// We're directly over another item
				newIndex = overIndex >= 0 ? overIndex : overItems.length;
			}

			// Update the task status
			const updatedTask = {
				...activeItems[activeIndex],
				status: overContainer,
			};

			return {
				...prev,
				[activeContainer]: prev[activeContainer].filter(
					(item) => item.id !== activeId
				),
				[overContainer]: [
					...prev[overContainer].slice(0, newIndex),
					updatedTask,
					...prev[overContainer].slice(newIndex),
				],
			};
		});
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) return;

		const activeId = active.id as string;
		const overId = over.id as string;

		// Find the containers
		const activeContainer = findTaskContainer(activeId);
		const overContainer = findTaskContainer(overId);

		if (!activeContainer || !overContainer) return;

		// Find the active task
		const task = findTask(activeId);
		if (!task) return;

		// Handle sorting within the same container
		if (activeContainer === overContainer) {
			setTasks((prev) => {
				const activeIndex = prev[activeContainer].findIndex(
					(item) => item.id === activeId
				);
				const overIndex = prev[overContainer].findIndex(
					(item) => item.id === overId
				);

				if (activeIndex !== overIndex) {
					return {
						...prev,
						[overContainer]: arrayMove(
							prev[overContainer],
							activeIndex,
							overIndex
						),
					};
				}
				return prev;
			});
		}

		// Update task on server
		try {
			const token = Cookies.get("token");
			const overItems = tasks[overContainer];
			const overIndex = overItems.findIndex((item) => item.id === overId);

			let newIndex: number;
			if (overId in tasks) {
				// We're at the root droppable of a container
				newIndex = overItems.length;
			} else {
				// We're directly over another item
				newIndex = overIndex >= 0 ? overIndex : overItems.length;
			}

			await axios.put(
				`${process.env.NEXT_PUBLIC_API_URL}/tasks/${activeId}`,
				{
					status: overContainer,
					order: newIndex,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			// Update all task orders in the affected columns
			const updatedTasks = { ...tasks };
			updatedTasks[overContainer].forEach(async (task, index) => {
				await axios.put(
					`${process.env.NEXT_PUBLIC_API_URL}/tasks/${task.id}`,
					{
						order: index,
					},
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
			});
		} catch (error) {
			console.error("Failed to update task status:", error);
			toast("Failed to update task status. Please try again.");
			// Revert optimistic update on error
			fetchTasks(projectId);
		} finally {
			setActiveId(null);
		}
	};

	const handleCreateTask = (task: Task) => {
		setIsTaskModalOpen(false);
		// Optimistically add the new task to the UI
		const newTasks = { ...tasks };
		newTasks[task.status].push(task);
		setTasks(newTasks);
		toast("Task created successfully");
		// Refresh tasks to get the server version
		fetchTasks(projectId);
	};

	const handleUpdateTask = () => {
		setIsTaskModalOpen(false);
		setEditingTask(null);
		// Refresh tasks to get the updated list
		fetchTasks(projectId);
		toast("Task updated successfully");
	};

	const handleDeleteTask = async (taskId: string) => {
		try {
			const token = Cookies.get("token");
			await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			toast("Task deleted successfully");
			// Refresh tasks
			fetchTasks(projectId);
		} catch (error) {
			console.error("Failed to delete task:", error);
			toast("Failed to delete task. Please try again.");
		}
	};

	const openEditTaskModal = (task: Task) => {
		setEditingTask(task);
		setIsTaskModalOpen(true);
	};

	const columns = [
		{ id: "todo" as TaskStatus, title: "To Do" },
		{ id: "in_progress" as TaskStatus, title: "In Progress" },
		{ id: "done" as TaskStatus, title: "Completed" },
	];

	return (
		<div className="container mx-auto py-6 px-4 min-h-screen">
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
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Skeleton className="h-64 w-full" />
						<Skeleton className="h-64 w-full" />
						<Skeleton className="h-64 w-full" />
					</div>
				</div>
			) : project ? (
				<div className="space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
						<div>
							<h1 className="text-3xl font-bold mb-2">{project.name}</h1>
							<div className="flex flex-wrap gap-2 mb-2">
								{project.deadline && (
									<Badge variant="outline" className="flex items-center gap-1">
										<CalendarIcon size={14} />
										Deadline:{" "}
										{format(new Date(project.deadline), "MMMM d, yyyy")}
									</Badge>
								)}
								<Badge variant="outline" className="flex items-center gap-1">
									<ClockIcon size={14} />
									Created:{" "}
									{format(new Date(project.created_at), "MMMM d, yyyy")}
								</Badge>
							</div>
							{project.description && (
								<p className="text-muted-foreground mt-2 line-clamp-2">
									{project.description}
								</p>
							)}
						</div>
						<div className="flex gap-2 self-start">
							<Button
								className="flex items-center gap-2"
								onClick={() => {
									setEditingTask(null);
									setIsTaskModalOpen(true);
								}}
							>
								<PlusIcon size={16} />
								Add Task
							</Button>
							<Button
								variant="outline"
								className="flex items-center gap-2"
								onClick={() => setIsUpdateModalOpen(true)}
							>
								<PencilIcon size={16} />
								Edit
							</Button>
							<Button
								variant="destructive"
								className="flex items-center gap-2"
								onClick={() => setIsDeleteDialogOpen(true)}
							>
								<Trash2Icon size={16} />
								Delete
							</Button>
						</div>
					</div>

					<DndContext
						sensors={sensors}
						collisionDetection={closestCorners}
						onDragStart={handleDragStart}
						onDragOver={handleDragOver}
						onDragEnd={handleDragEnd}
					>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
							{columns.map((column) => (
								<TaskColumn
									key={column.id}
									id={column.id}
									title={column.title}
									tasks={tasks[column.id]}
									color={column.id}
									onTaskEdit={openEditTaskModal}
									onTaskDelete={handleDeleteTask}
								/>
							))}
						</div>
					</DndContext>
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
							project{project && ` "${project.name}"`} and all associated tasks.
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

			<UpdateProjectModal
				project={project}
				isOpen={isUpdateModalOpen}
				onClose={() => setIsUpdateModalOpen(false)}
				onSuccess={handleUpdateProjectSuccess}
			/>

			<TaskModal
				isOpen={isTaskModalOpen}
				onClose={() => {
					setIsTaskModalOpen(false);
					setEditingTask(null);
				}}
				projectId={projectId}
				task={editingTask}
				onCreateSuccess={handleCreateTask}
				onUpdateSuccess={handleUpdateTask}
			/>
		</div>
	);
}
