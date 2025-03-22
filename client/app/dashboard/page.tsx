"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Dashboard() {
	return (
		<div className="flex flex-col min-h-screen bg-background p-4">
			<header className="flex justify-between items-center py-4 px-6 border-b">
				<h1 className="text-2xl font-bold">Dashboard</h1>
				<Button variant="ghost">
					<LogOut className="mr-2 h-4 w-4" /> Logout
				</Button>
			</header>

			<main className="flex-grow p-6">
				<Card className="w-full max-w-4xl mx-auto">
					<CardHeader>
						<CardTitle>Welcome to shiroe</CardTitle>
						<CardDescription>
							You have successfully logged in to the protected dashboard.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p>
							This is a protected route. Only authenticated users can access
							this page.
						</p>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
