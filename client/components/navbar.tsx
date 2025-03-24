"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ThemeToggle } from "./theme-toggle";
import { formatDistanceToNow } from "date-fns";

import {
	Search,
	Bell,
	User,
	Settings,
	LogOut,
	ChevronDown,
	Check,
	AlertCircle,
	Clock,
	Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/context/notification-context";

interface NavbarProps {
	userName?: string;
	userEmail?: string;
}

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

const NotificationItem = ({ notification, onRead }: NotificationItemProps) => {
	interface NotificationType {
		type:
			| "deadline_approaching"
			| "task_assigned"
			| "status_change"
			| "priority_change"
			| string;
	}

	const getIcon = (type: NotificationType["type"]) => {
		switch (type) {
			case "deadline_approaching":
				return <Clock className="h-4 w-4 text-orange-500" />;
			case "task_assigned":
				return <Info className="h-4 w-4 text-blue-500" />;
			case "status_change":
				return <Info className="h-4 w-4 text-green-500" />;
			case "priority_change":
				return <AlertCircle className="h-4 w-4 text-red-500" />;
			default:
				return <Info className="h-4 w-4" />;
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
				{!notification.isRead && (
					<Button
						variant="ghost"
						size="sm"
						className="h-7 w-7 p-0"
						onClick={() => onRead(notification.id)}
					>
						<Check className="h-4 w-4" />
						<span className="sr-only">Mark as read</span>
					</Button>
				)}
			</div>
		</div>
	);
};

const Navbar: React.FC<NavbarProps> = ({
	userName = "John Doe",
	userEmail = "john.doe@example.com",
}) => {
	const router = useRouter();
	const {
		notifications,
		unreadCount,
		markNotificationAsRead,
		markAllNotificationsAsRead,
	} = useNotifications();
	const [isOpen, setIsOpen] = useState(false);

	const handleLogout = () => {
		localStorage.removeItem("token");
		Cookies.remove("token");
		router.push("/login");
	};

	const handleMarkAllAsRead = () => {
		markAllNotificationsAsRead();
	};

	return (
		<header className="sticky top-0 z-40 border-b bg-background">
			<div className="container flex h-16 items-center justify-end py-4">
				<div className="flex items-center gap-4">
					<form className="hidden lg:block">
						<div className="relative">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Search..."
								className="w-[200px] pl-8 bg-background"
							/>
						</div>
					</form>

					<Popover open={isOpen} onOpenChange={setIsOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
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
										onClick={handleMarkAllAsRead}
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

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" className="gap-2">
								<Avatar className="h-8 w-8">
									<AvatarImage src="" alt={userName} />
									<AvatarFallback>
										{userName
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								{userName}
								<ChevronDown className="h-4 w-4 text-muted-foreground" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium leading-none">{userName}</p>
									<p className="text-xs leading-none text-muted-foreground">
										{userEmail}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<User className="mr-2 h-4 w-4" />
								Profile
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Settings className="mr-2 h-4 w-4" />
								Settings
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleLogout}>
								<LogOut className="mr-2 h-4 w-4" />
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>

					<ThemeToggle />
				</div>
			</div>
		</header>
	);
};

export default Navbar;
