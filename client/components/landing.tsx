"use client";

import React from "react";
import { Zap, Clipboard, Users, CheckCircle, Trello } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// Hero Section
const HeroSection: React.FC = () => {
	return (
		<div className="container relative mx-auto px-4 py-16 md:py-24 text-center min-h-[50vh] flex flex-col justify-center">
			<div className="max-w-5xl mx-auto px-6 text-center space-y-6">
				<h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mx-auto">
					<span className="bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">
						Project Management
					</span>{" "}
					Reimagined
				</h1>

				<p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
					Effortlessly track, prioritize, and complete tasks with our intuitive
					project management platform that transforms how teams collaborate.
				</p>

				<div className="mt-8 flex justify-center space-x-4">
					<Link href="/register">
						<Button size="lg" className="group">
							Get Started
							<Zap className="ml-2 w-4 h-4 group-hover:animate-pulse" />
						</Button>
					</Link>
					<Button
						variant="outline"
						size="lg"
						className="group hover:bg-accent hover:text-accent-foreground"
					>
						Learn More
					</Button>
				</div>
			</div>

			<div
				className="absolute inset-0 -z-10 opacity-10 bg-gradient-to-br from-primary/10 via-background to-chart-3/10"
				aria-hidden="true"
			/>
		</div>
	);
};

// User Journey Section
const UserJourneySection: React.FC = () => {
	const steps = [
		{
			icon: Users,
			title: "Sign Up & Create Account",
			description: "Quick and easy registration to get started with your team.",
			color: "text-chart-2",
		},
		{
			icon: Clipboard,
			title: "Create Your First Project",
			description: "Set up projects with custom workflows and team structures.",
			color: "text-chart-3",
		},
		{
			icon: Trello,
			title: "Manage Tasks Effortlessly",
			description: "Assign, track, and prioritize tasks with intuitive boards.",
			color: "text-chart-4",
		},
		{
			icon: CheckCircle,
			title: "Track Progress & Collaborate",
			description: "Real-time updates and seamless team communication.",
			color: "text-chart-5",
		},
	];

	return (
		<div className="container mx-auto px-4 py-16 md:py-24">
			<div className="text-center mb-12">
				<h2 className="text-3xl md:text-4xl font-bold mb-4">
					Your Project Management Journey
				</h2>
				<p className="text-muted-foreground max-w-2xl mx-auto">
					From signup to project completion, our platform simplifies every step
					of your workflow.
				</p>
			</div>

			<div className="grid md:grid-cols-4 gap-6">
				{steps.map((step) => (
					<Card key={step.title} className="hover:shadow-lg transition-all">
						<CardHeader className="pb-4">
							<div className={`mb-4 ${step.color}`}>
								<step.icon className="w-10 h-10" />
							</div>
							<CardTitle className="text-xl">{step.title}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">{step.description}</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};

const ProjectManagementLanding: React.FC = () => {
	return (
		<>
			<HeroSection />
			<UserJourneySection />
		</>
	);
};

export default ProjectManagementLanding;
