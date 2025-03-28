"use client";
import React from "react";
import { Badge } from "@/components/ui/badge";

const HeroHeader: React.FC = () => {
	return (
		<div className="container mx-auto px-4 py-16 text-center min-h-[40vh]">
			<div className="max-w-5xl mx-auto px-6 text-center mb-8">
				<Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/15 border-none">
					Streamline Your Workflow
				</Badge>

				<div className="space-y-8">
					<h1 className="text-3xl sm:4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mx-auto">
						<span className="bg-gradient-to-r from-chart-2 to-chart-3 bg-clip-text text-transparent">
							Project Management Reimagined
						</span>
					</h1>

					<p className="text-md sm:lg md:text-xl font-medium text-muted-foreground max-w-3xl mx-auto">
						Effortlessly track, prioritize, and complete tasks with intuitive
						project management tools.
					</p>

				</div>
			</div>

			<div className="mt-8 flex justify-center space-x-4">
				<button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
					Get Started
				</button>
			</div>
		</div>
	);
};

export default HeroHeader;
