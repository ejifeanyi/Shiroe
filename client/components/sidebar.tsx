"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

import {
	LayoutDashboard,
	FolderKanban,
	Settings,
	LogOut,
	ChevronRight,
	ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Project {
	id: string;
	name: string;
	total_tasks: number;
	completed_tasks: number;
}

interface SidebarProps {
	collapsed: boolean;
	setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
	const pathname = usePathname();
	const router = useRouter();
	const [recentProjects, setRecentProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchProjects = async () => {
			try {
				const response = await fetch(
					"http://localhost:8000/api/v1/projects?limit=5"
				);
				const data = await response.json();
				setRecentProjects(data);
			} catch (error) {
				console.error("Error fetching projects:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProjects();
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		Cookies.remove("token");
		router.push("/login");
	};

	const navItems = [
		{ icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
		{ icon: FolderKanban, label: "Projects", href: "/projects" },
		{ icon: Settings, label: "Settings", href: "/settings" },
	];

	return (
		<aside
			className={cn(
				"h-screen bg-card border-r flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out",
				collapsed ? "w-16" : "w-64"
			)}
		>
			<div className="p-4 flex items-center justify-between">
				{!collapsed ? (
					<h1 className="text-xl font-bold">Shiroe</h1>
				) : (
					<h1 className="text-xl font-bold">S</h1>
				)}
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setCollapsed(!collapsed)}
					className="h-8 w-8"
				>
					{collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
				</Button>
			</div>

			<ScrollArea className="flex-grow px-3 py-2">
				<nav className="space-y-1">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
								pathname === item.href
									? "bg-accent text-accent-foreground"
									: "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
							)}
						>
							<item.icon
								size={18}
								className={cn("min-w-5", !collapsed && "mr-2")}
							/>
							{!collapsed && <span>{item.label}</span>}
						</Link>
					))}
				</nav>

				{!collapsed && !isLoading && recentProjects.length > 0 && (
					<>
						<Separator className="my-4" />
						<div className="mb-2">
							<h2 className="text-xs uppercase font-semibold tracking-wider text-muted-foreground mb-3 px-3">
								Recent Projects
							</h2>
							<div className="space-y-1">
								{recentProjects.map((project) => (
									<Link
										key={project.id}
										href={`/projects/${project.id}`}
										className={cn(
											"flex flex-col py-2 px-3 rounded-md text-sm transition-colors",
											pathname === `/projects/${project.id}`
												? "bg-accent text-accent-foreground"
												: "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
										)}
									>
										<span className="font-medium truncate">{project.name}</span>
										<div className="flex items-center text-xs mt-1 space-x-1">
											<span>
												{project.completed_tasks}/{project.total_tasks} tasks
											</span>
											<div className="w-full bg-secondary h-1 rounded-full ml-2">
												<div
													className="bg-primary h-1 rounded-full"
													style={{
														width: `${
															project.total_tasks
																? (project.completed_tasks /
																		project.total_tasks) *
																  100
																: 0
														}%`,
													}}
												></div>
											</div>
										</div>
									</Link>
								))}
							</div>
						</div>
					</>
				)}
			</ScrollArea>

			<div className="p-3 mt-auto">
				<Button
					variant="secondary"
					size={collapsed ? "icon" : "default"}
					className={cn("w-full justify-start", collapsed && "justify-center")}
					onClick={() => handleLogout()}
				>
					<LogOut size={18} className={collapsed ? "" : "mr-2"} />
					{!collapsed && "Logout"}
				</Button>
			</div>
		</aside>
	);
};

export default Sidebar;
