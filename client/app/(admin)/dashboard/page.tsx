"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function Dashboard() {
	return (
		<div className="flex flex-col min-h-screen bg-background p-4">

			<main className="flex-grow p-6">
				<Card className="w-full max-w-4xl mx-auto">
					<CardHeader>
						<CardTitle>Welcome to shiroe</CardTitle>
						<CardDescription>
							You have successfully logged in to the protected dashboard.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
							This is a protected route. Only authenticated users can access
							this page.
						</p>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
