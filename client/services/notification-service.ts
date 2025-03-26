// services/notificationService.ts
import axios from "axios";
import Cookies from "js-cookie";

export interface Notification {
	id: string;
	title: string;
	message: string;
	type:
		| "deadline_approaching"
		| "task_assigned"
		| "status_change"
		| "priority_change";
	isRead: boolean;
	createdAt: string;
	taskId?: string;
	projectId?: string;
	taskTitle?: string;
	projectName?: string;
	taskPriority?: string;
	taskStatus?: string;
	taskDueDate?: string;
}

const API_URL =
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const getAuthHeaders = () => {
	const token = Cookies.get("token");
	return {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};
};

export const getNotifications = async (
	includeRead: boolean = false
): Promise<Notification[]> => {
	const response = await axios.get(
		`${API_URL}/notifications?include_read=${includeRead}`,
		getAuthHeaders()
	);
	return response.data;
};

export const markAsRead = async (
	notificationId: string
): Promise<Notification> => {
	const response = await axios.patch(
		`${API_URL}/notifications/${notificationId}/read`,
		getAuthHeaders()
	);
	return response.data;
};

export const markAllAsRead = async (): Promise<{ message: string }> => {
	const response = await axios.patch(
		`${API_URL}/notifications/read-all`,
		{},
		getAuthHeaders()
	);
	return response.data;
};

export const checkDeadlines = async (): Promise<{ message: string }> => {
	const response = await axios.post(
		`${API_URL}/notifications/check-deadlines`,
		{},
		getAuthHeaders()
	);
	return response.data;
};
