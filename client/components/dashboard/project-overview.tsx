// components/dashboard/ProjectsOverview.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types/dashboard";
import { Progress } from "@/components/ui/progress";

interface ProjectsOverviewProps {
	projects: Project[];
}

export default function ProjectsOverview({ projects }: ProjectsOverviewProps) {
	// Project colors if not provided
	const defaultColors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

	return (
		<Card className="h-full">
			<CardHeader>
				<CardTitle>Recent Projects</CardTitle>
			</CardHeader>
			<CardContent>
				{projects.length > 0 ? (
					<div className="space-y-6">
						{projects.map((project, index) => (
							<div key={project.id} className="space-y-2">
								<div className="flex justify-between items-center">
									<h3 className="font-medium truncate">{project.name}</h3>
									<span className="text-xs text-muted-foreground">
										{project.task_count} tasks
									</span>
								</div>
								<Progress
									value={45}
									className="h-2"
									style={
										{
											"--progress-background":
												project.color ||
												defaultColors[index % defaultColors.length],
										} as React.CSSProperties
									}
								/>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-6">
						<p className="text-muted-foreground">No projects found</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
