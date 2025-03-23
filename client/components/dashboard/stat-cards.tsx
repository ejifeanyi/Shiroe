// components/dashboard/StatsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/types/dashboard";
import {
	ClipboardList,
	FolderKanban,
	CheckCircle,
	BarChart,
} from "lucide-react";

interface StatsCardsProps {
	stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
	const items = [
		{
			title: "Total Projects",
			value: stats.total_projects,
			icon: <FolderKanban className="h-5 w-5 text-muted-foreground" />,
			description: "Active projects",
		},
		{
			title: "Total Tasks",
			value: stats.total_tasks,
			icon: <ClipboardList className="h-5 w-5 text-muted-foreground" />,
			description: "All tasks",
		},
		{
			title: "Completed",
			value: stats.completed_tasks,
			icon: <CheckCircle className="h-5 w-5 text-muted-foreground" />,
			description: "Completed tasks",
		},
		{
			title: "Completion Rate",
			value: `${stats.completion_rate}%`,
			icon: <BarChart className="h-5 w-5 text-muted-foreground" />,
			description: "Task completion rate",
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
			{items.map((item, index) => (
				<Card key={index}>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							{item.title}
						</CardTitle>
						{item.icon}
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{item.value}</div>
						<p className="text-xs text-muted-foreground">{item.description}</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
