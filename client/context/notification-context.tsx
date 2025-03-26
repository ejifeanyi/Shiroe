// contexts/NotificationContext.tsx
"use client";

import { getNotifications, markAllAsRead, markAsRead } from "@/services/notification-service";
import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

interface Notification {
	id: string;
	isRead: boolean;
	// Add other properties that match your notification service response
}

interface NotificationContextType {
	notifications: Notification[];
	unreadCount: number;
	loading: boolean;
	error: string | null;
	fetchNotifications: () => Promise<void>;
	markNotificationAsRead: (id: string) => Promise<void>;
	markAllNotificationsAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const fetchNotifications = async () => {
		try {
			setLoading(true);
			const data = await getNotifications();
			setNotifications(data);
			setError(null);
		} catch (err) {
			setError("Failed to fetch notifications");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	const markNotificationAsRead = async (id: string) => {
		try {
			await markAsRead(id);
			setNotifications((prev) =>
				prev.map((notification) =>
					notification.id === id
						? { ...notification, isRead: true }
						: notification
				)
			);
		} catch (err) {
			setError("Failed to mark notification as read");
			console.error(err);
		}
	};

	const markAllNotificationsAsRead = async () => {
		try {
			await markAllAsRead();
			setNotifications((prev) =>
				prev.map((notification) => ({ ...notification, isRead: true }))
			);
		} catch (err) {
			setError("Failed to mark all notifications as read");
			console.error(err);
		}
	};

	// Calculate unread count
	const unreadCount = notifications.filter((n) => !n.isRead).length;

	// Fetch notifications on component mount
	useEffect(() => {
		fetchNotifications();

		// Poll for new notifications every minute
		const intervalId = setInterval(fetchNotifications, 60000);

		return () => clearInterval(intervalId);
	}, []);

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				unreadCount,
				loading,
				error,
				fetchNotifications,
				markNotificationAsRead,
				markAllNotificationsAsRead,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
};

export const useNotifications = () => {
	const context = useContext(NotificationContext);
	if (context === undefined) {
		throw new Error(
			"useNotifications must be used within a NotificationProvider"
		);
	}
	return context;
};
