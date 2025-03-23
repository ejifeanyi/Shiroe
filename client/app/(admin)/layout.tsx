'use client'

import React, { ReactNode, useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";

interface LayoutProps {
	children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkScreenSize = () => {
			setIsMobile(window.innerWidth < 768);
			setIsSidebarCollapsed(window.innerWidth < 1024);
		};

		// Initial check
		checkScreenSize();

		// Add event listener
		window.addEventListener("resize", checkScreenSize);

		// Cleanup
		return () => window.removeEventListener("resize", checkScreenSize);
	}, []);

	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar
				collapsed={isSidebarCollapsed}
				setCollapsed={setIsSidebarCollapsed}
			/>

			<div
				className={cn(
					"flex flex-col flex-1 transition-all duration-300 ease-in-out",
					isSidebarCollapsed ? "ml-16" : "ml-64",
					isMobile && "ml-0"
				)}
			>
				<Navbar />
				<main className="flex-1 p-6 overflow-auto">{children}</main>
			</div>
		</div>
	);
};

export default Layout;
