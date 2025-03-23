"use client";

import { useEffect, useState } from "react";

import { DashboardData } from "@/types/dashboard";
import StatsCards from "@/components/dashboard/stat-cards";
import ProjectsOverview from "@/components/dashboard/project-overview";
import TaskList from "@/components/dashboard/task-list";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchDashboardData } from "@/lib/api";

export default function Dashboard() {
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(
		null
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadDashboardData = async () => {
			try {
				const data = await fetchDashboardData();
				setDashboardData(data);
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};

		loadDashboardData();
	}, []);

	return (
		<main className="container mx-auto p-4 md:p-6 max-w-7xl">
			<h1 className="text-3xl font-bold mb-6">Dashboard</h1>
			{loading ? (
				<DashboardSkeleton />
			) : dashboardData ? (
				<div className="space-y-6">
					<StatsCards stats={dashboardData.stats} />

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="md:col-span-1">
							<ProjectsOverview projects={dashboardData.recent_projects} />
						</div>
						<div className="md:col-span-2">
							<div className="space-y-6">
								<TaskList
									title="Today's Tasks"
									tasks={dashboardData.today_tasks}
									emptyMessage="No tasks for today"
								/>
								<TaskList
									title="Overdue Tasks"
									tasks={dashboardData.overdue_tasks}
									emptyMessage="No overdue tasks"
									variant="destructive"
								/>
								<TaskList
									title="Upcoming Tasks"
									tasks={dashboardData.upcoming_tasks}
									emptyMessage="No upcoming tasks"
								/>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div className="text-center py-10">
					<p>Failed to load dashboard data. Please try again later.</p>
				</div>
			)}
		</main>
	);
}

function DashboardSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
				{[1, 2, 3, 4].map((item) => (
					<Skeleton key={item} className="h-[100px] w-full" />
				))}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Skeleton className="h-[300px] w-full" />
				<div className="md:col-span-2 space-y-6">
					{[1, 2, 3].map((item) => (
						<Skeleton key={item} className="h-[200px] w-full" />
					))}
				</div>
			</div>
		</div>
	);
}
