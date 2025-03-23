import { DashboardData, AnalyticsData } from "@/types/dashboard";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:8000/api/v1";

/**
 * Helper function to create headers with authentication token
 */
const getAuthHeaders = () => {
	const token = Cookies.get("token");

	if (!token) {
		throw new Error("Authentication token not found");
	}

	return {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
	};
};

export async function fetchDashboardData(): Promise<DashboardData> {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/`, {
            method: 'GET',
            credentials: 'include',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server error response:", errorText);
            throw new Error(`Failed to fetch dashboard data: ${response.status} ${response.statusText}`);
        }

        return response.json();
    } catch (error) {
        console.error("Dashboard data fetch error:", error);
        throw error;
    }
}

export async function fetchAnalyticsData(
	days: number = 30
): Promise<AnalyticsData> {
	try {
		// Fixed the URL format - removed trailing slash after the parameter
		const response = await fetch(
			`${API_BASE_URL}/dashboard/analytics?days=${days}`,
			{
				headers: getAuthHeaders(),
			}
		);

		if (!response.ok) {
			throw new Error(`Failed to fetch analytics data: ${response.statusText}`);
		}

		return response.json();
	} catch (error) {
		console.error("Analytics data fetch error:", error);
		throw error;
	}
}
