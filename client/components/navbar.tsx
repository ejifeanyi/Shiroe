"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

import { formatDistanceToNow } from "date-fns";

import { Search, Bell, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/context/notification-context";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";

import PriorityTasksButton from "./priority-task-button";
import CreateProjectButton from "./create-project-button";
import CreateProjectModal from "./project/create-project-modal";

import { Project } from "@/types/project";

interface Notification {
	id: string;
	type: string;
	title: string;
	message: string;
	createdAt: string;
	isRead: boolean;
}

interface NotificationItemProps {
	notification: Notification;
	onRead: (id: string) => void;
}

const NotificationItem = ({ notification }: NotificationItemProps) => {
	const getIcon = (type: string) => {
		switch (type) {
			case "deadline_approaching":
				return <Calendar className="h-4 w-4 text-orange-500" />;
			case "task_assigned":
				return <User className="h-4 w-4 text-blue-500" />;
			case "status_change":
				return <User className="h-4 w-4 text-green-500" />;
			case "priority_change":
				return <Calendar className="h-4 w-4 text-red-500" />;
			default:
				return <User className="h-4 w-4" />;
		}
	};

	return (
		<div
			className={`p-3 border-b last:border-b-0 ${
				notification.isRead
					? "bg-gray-50 dark:bg-gray-800"
					: "bg-white dark:bg-gray-700"
			}`}
		>
			<div className="flex justify-between items-start">
				<div className="flex gap-2">
					{getIcon(notification.type)}
					<div>
						<p className="text-sm font-medium">{notification.title}</p>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							{notification.message}
						</p>
						<p className="text-xs text-gray-400 mt-1">
							{formatDistanceToNow(new Date(notification.createdAt), {
								addSuffix: true,
							})}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

const Navbar: React.FC = () => {
	const router = useRouter();
	const {
		notifications,
		unreadCount,
		markNotificationAsRead,
		markAllNotificationsAsRead,
	} = useNotifications();
	const [isNotificationOpen, setIsNotificationOpen] = useState(false);
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

						<Popover
							open={isNotificationOpen}
							onOpenChange={setIsNotificationOpen}
						>
							<PopoverTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="relative"
									aria-label="Open notifications"
								>
									<Bell className="h-5 w-5" />
									{unreadCount > 0 && (
										<Badge
											className="absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px]"
											variant="destructive"
										>
											{unreadCount}
										</Badge>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-80 p-0 max-h-[400px] overflow-hidden flex flex-col"
								align="end"
							>
								<div className="p-3 border-b flex justify-between items-center">
									<h3 className="font-medium">Notifications</h3>
									{unreadCount > 0 && (
										<Button
											variant="ghost"
											size="sm"
											className="h-8 text-xs"
											onClick={markAllNotificationsAsRead}
										>
											Mark all as read
										</Button>
									)}
								</div>

								<div className="overflow-y-auto flex-grow">
									{notifications.length === 0 ? (
										<div className="p-4 text-center text-sm text-gray-500">
											No new notifications
										</div>
									) : (
										(notifications as Notification[]).map((notification) => (
											<NotificationItem
												key={notification.id}
												notification={notification}
												onRead={markNotificationAsRead}
											/>
										))
									)}
								</div>
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
