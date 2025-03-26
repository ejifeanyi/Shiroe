"use client";

import React, { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import {
	Flag,
	Clock,
	CheckCircle,
	AlertCircle,
	ChevronRight,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CardTitle, CardDescription } from "./ui/card";
import { formatDistanceToNow, parseISO } from "date-fns";

interface PriorityTask {
	id: string;
	title: string;
	description: string;
	project_id: string;
	priority: "low" | "medium" | "high";
	due_date: string;
	status: "not_started" | "in_progress" | "completed";
}

const PriorityTasksButton: React.FC = () => {
	const router = useRouter();
	const [priorityTasks, setPriorityTasks] = useState<PriorityTask[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchPriorityTasks = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const token = Cookies.get("token");
			if (!token) {
				throw new Error("No authentication token found");
			}

			const response = await fetch(
				"http://localhost:8000/api/v1/tasks/prioritize/",
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (!response.ok) {
				throw new Error("Failed to fetch priority tasks");
			}

			const data = await response.json();
			console.log("Priority", data);
			setPriorityTasks(data);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unknown error occurred"
			);
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const getPriorityStyles = (priority: "low" | "medium" | "high") => {
		switch (priority) {
			case "high":
				return {
					borderColor: "border-red-500",
					bgColor: "bg-red-50",
					iconColor: "text-red-500",
				};
			case "medium":
				return {
					borderColor: "border-yellow-500",
					bgColor: "bg-yellow-50",
					iconColor: "text-yellow-500",
				};
			case "low":
				return {
					borderColor: "border-green-500",
					bgColor: "bg-green-50",
					iconColor: "text-green-500",
				};
			default:
				return {
					borderColor: "border-gray-300",
					bgColor: "bg-gray-50",
					iconColor: "text-gray-500",
				};
		}
	};

	const getStatusIcon = (
		status: "not_started" | "in_progress" | "completed"
	) => {
		switch (status) {
			case "not_started":
				return <AlertCircle className="h-4 w-4 text-orange-500" />;
			case "in_progress":
				return <Clock className="h-4 w-4 text-blue-500" />;
			case "completed":
				return <CheckCircle className="h-4 w-4 text-green-600" />;
		}
	};

	const handleTaskClick = (projectId: string) => {
		router.push(`/projects/${projectId}`);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Priority Tasks"
					onClick={fetchPriorityTasks}
					className="relative"
				>
					<Flag className="h-5 w-5" />
					{priorityTasks.length > 0 && (
						<span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
							{priorityTasks.length}
						</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-96 p-0 max-h-[500px] overflow-hidden flex flex-col shadow-xl rounded-xl">
				<div className="p-4 border-b bg-gray-50 flex justify-between items-center">
					<div className="flex items-center gap-2">
						<Flag className="h-5 w-5 text-gray-600" />
						<h3 className="font-semibold text-gray-800">Priority Tasks</h3>
					</div>
				</div>

				<div className="overflow-y-auto flex-grow">
					{isLoading ? (
						<div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center justify-center space-y-2">
							<Clock className="h-8 w-8 text-blue-500 animate-spin" />
							<p>Loading priority tasks...</p>
						</div>
					) : error ? (
						<div className="p-6 text-center text-sm text-red-500 flex flex-col items-center justify-center space-y-2">
							<AlertCircle className="h-8 w-8 text-red-500" />
							<p>{error}</p>
						</div>
					) : priorityTasks.length === 0 ? (
						<div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center justify-center space-y-2">
							<Flag className="h-8 w-8 text-gray-400" />
							<p>No priority tasks found</p>
						</div>
					) : (
						priorityTasks.map((task) => {
							const priorityStyles = getPriorityStyles(task.priority);
							return (
								<div
									key={task.id}
									className={`p-4 border-l-4 hover:bg-gray-100 transition-colors duration-200 cursor-pointer group ${priorityStyles.borderColor} ${priorityStyles.bgColor}`}
									onClick={() => handleTaskClick(task.project_id)}
								>
									<div className="flex justify-between items-start">
										<div className="flex-grow pr-2">
											<div className="flex items-center gap-2 mb-1">
												{getStatusIcon(task.status)}
												<CardTitle className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
													{task.title}
												</CardTitle>
											</div>
											<CardDescription className="text-xs text-gray-500 mb-2">
												{task.description}
											</CardDescription>
											<div className="flex items-center gap-2 text-xs text-gray-500">
												<Clock className="h-3 w-3" />
												<span>
													Due{" "}
													{formatDistanceToNow(parseISO(task.due_date), {
														addSuffix: true,
													})}
												</span>
											</div>
										</div>
										<div
											className={`flex items-center ${priorityStyles.iconColor}`}
										>
											<span className="font-medium text-xs mr-1 uppercase">
												{task.priority}
											</span>
											<ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default PriorityTasksButton;
