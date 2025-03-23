import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Cookies from "js-cookie";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Task, TaskPriority, TaskStatus } from "@/types/task";

interface TaskModalProps {
	isOpen: boolean;
	onClose: () => void;
	projectId: string;
	task?: Task | null;
	onCreateSuccess?: (task: Task) => void;
	onUpdateSuccess?: (task: Task) => void;
}

interface TaskFormValues {
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	due_date: Date | null;
}

export default function TaskModal({
	isOpen,
	onClose,
	projectId,
	task,
	onCreateSuccess,
	onUpdateSuccess,
}: TaskModalProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isEditing = !!task;

	const form = useForm<TaskFormValues>({
		defaultValues: {
			title: "",
			description: "",
			status: TaskStatus.TODO,
			priority: TaskPriority.MEDIUM,
			due_date: null,
		},
	});

	// Reset form when the modal opens or task changes
	useEffect(() => {
		if (isOpen) {
			if (task) {
				form.reset({
					title: task.title,
					description: task.description || "",
					status: task.status,
					priority: task.priority,
					due_date: task.due_date ? new Date(task.due_date) : null,
				});
			} else {
				form.reset({
					title: "",
					description: "",
					status: TaskStatus.TODO,
					priority: TaskPriority.MEDIUM,
					due_date: null,
				});
			}
		}
	}, [isOpen, task, form]);

	const onSubmit = async (data: TaskFormValues) => {
		setIsSubmitting(true);
		try {
			const token = Cookies.get("token");
			if (!token) {
				toast("You need to log in again");
				return;
			}

			const payload = {
				...data,
				project_id: projectId,
			};

			let response;
			if (isEditing && task) {
				// Update existing task
				response = await axios.put(
					`${process.env.NEXT_PUBLIC_API_URL}/tasks/${task.id}`,
					payload,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				if (onUpdateSuccess) onUpdateSuccess(response.data);
			} else {
				// Create new task
				response = await axios.post(
					`${process.env.NEXT_PUBLIC_API_URL}/tasks`,
					payload,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				if (onCreateSuccess) onCreateSuccess(response.data);
			}
		} catch (error) {
			console.error("Failed to save task:", error);
			toast(
				`Failed to ${isEditing ? "update" : "create"} task. Please try again.`
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Edit Task" : "Create New Task"}
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="title"
							rules={{ required: "Title is required" }}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="Task title" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Task description (optional)"
											className="resize-none"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Status</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="todo">To Do</SelectItem>
												<SelectItem value="in_progress">In Progress</SelectItem>
												<SelectItem value="done">Completed</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="priority"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Priority</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value}
											value={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select priority" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="low">Low</SelectItem>
												<SelectItem value="medium">Medium</SelectItem>
												<SelectItem value="high">High</SelectItem>
												<SelectItem value="urgent">Urgent</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="due_date"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Due Date</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													className={`w-full justify-start text-left font-normal ${
														!field.value && "text-muted-foreground"
													}`}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{field.value ? (
														format(field.value, "PPP")
													) : (
														<span>Pick a date</span>
													)}
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="single"
												selected={field.value || undefined}
												onSelect={field.onChange}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className="gap-2 sm:gap-0">
							<Button type="button" variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting
									? "Saving..."
									: isEditing
									? "Update Task"
									: "Create Task"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
