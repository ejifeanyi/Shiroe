// utils/auth.ts
import { useEffect } from "react";
import { useRouter } from "next/router";

// Function to check if the user is authenticated
export const isAuthenticated = (): boolean => {
	if (typeof window === "undefined") {
		return false;
	}

	const token = localStorage.getItem("authToken");
	return !!token;
};

// Hook to protect routes
export const useAuthProtection = (redirectTo: string = "/login"): boolean => {
	const router = useRouter();
	const authenticated = isAuthenticated();

	useEffect(() => {
		if (!authenticated && router.pathname !== redirectTo) {
			router.push(redirectTo);
		}
	}, [authenticated, router, redirectTo]);

	return authenticated;
};

// Function to get auth token
export const getAuthToken = (): string | null => {
	if (typeof window === "undefined") {
		return null;
	}

	return localStorage.getItem("authToken");
};

// Function to set auth token
export const setAuthToken = (token: string): void => {
	localStorage.setItem("authToken", token);
};

// Function to remove auth token (logout)
export const removeAuthToken = (): void => {
	localStorage.removeItem("authToken");
};
