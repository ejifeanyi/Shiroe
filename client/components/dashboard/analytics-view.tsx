// components/dashboard/AnalyticsView.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { AnalyticsData } from "@/types/dashboard";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
} from "recharts";

interface AnalyticsViewProps {
	data: AnalyticsData;
	onPeriodChange: (days: number) => void;
}

export default function AnalyticsView({
	data,
	onPeriodChange,
}: AnalyticsViewProps) {
	// Prepare data for the priority pie chart
	const priorityData = Object.entries(data.priority_distribution).map(
		([key, value]) => ({
			name: key.charAt(0).toUpperCase() + key.slice(1),
			value,
		})
	);

	// Colors for priority pie chart
	const PRIORITY_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

	// Prepare data for completion rate chart
	const completionData = [
		{ name: "Completed", value: data.completed_tasks },
		{ name: "In Progress", value: data.created_tasks - data.completed_tasks },
	];

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-bold">Task Analytics</h2>
				<Select
					defaultValue={data.period_days.toString()}
					onValueChange={(value: string) => onPeriodChange(parseInt(value))}
				>
					<SelectTrigger className="w-32">
						<SelectValue placeholder="Select period" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="7">Last 7 days</SelectItem>
						<SelectItem value="30">Last 30 days</SelectItem>
						<SelectItem value="90">Last 90 days</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Task Completion</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={completionData}
									margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
								>
									<XAxis dataKey="name" />
									<YAxis />
									<Tooltip />
									<Bar dataKey="value" fill="#4f46e5" />
								</BarChart>
							</ResponsiveContainer>
						</div>
						<div className="mt-4 grid grid-cols-2 gap-4 text-center">
							<div>
								<p className="text-sm text-muted-foreground">Completion Rate</p>
								<p className="text-2xl font-bold">{data.completion_rate}%</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">Tasks Created</p>
								<p className="text-2xl font-bold">{data.created_tasks}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Task Priority Distribution</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={priorityData}
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={90}
										paddingAngle={2}
										dataKey="value"
										label={({ name, percent }: { name: string; percent: number }) =>
											`${name} ${(percent * 100).toFixed(0)}%`
										}
									>
										{priorityData.map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip />
								</PieChart>
							</ResponsiveContainer>
						</div>
						<div className="mt-2 grid grid-cols-2 gap-2">
							{priorityData.map((item, index) => (
								<div key={item.name} className="flex items-center gap-2">
									<div
										className="w-3 h-3 rounded-full"
										style={{
											backgroundColor:
												PRIORITY_COLORS[index % PRIORITY_COLORS.length],
										}}
									/>
									<span className="text-sm">
										{item.name}: {item.value}
									</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
