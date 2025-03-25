"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Bell } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { settingsSchema, SettingsFormValues } from "@/lib/settings";

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState("account");
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<SettingsFormValues>({
		resolver: zodResolver(settingsSchema),
		defaultValues: {
			email: "",
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
			emailNotifications: true,
			pushNotifications: true,
		},
	});

	const onSubmit = async (data: SettingsFormValues) => {
		setIsLoading(true);
		try {
			if (activeTab === "account") {
				await axios.put("/api/v1/settings/account", {
					email: data.email,
					current_password: data.currentPassword,
					password: data.newPassword,
				});
			} else {
				await axios.put("/api/v1/settings/notifications", {
					email_notifications: data.emailNotifications,
					push_notifications: data.pushNotifications,
				});
			}

			toast("Settings updated successfully");
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Failed to update settings";
			toast(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container mx-auto py-8">
			<div className="max-w-3xl mx-auto bg-card rounded-lg shadow p-6">
				<h1 className="text-2xl font-bold mb-6">Settings</h1>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="account">Account</TabsTrigger>
						<TabsTrigger value="notifications">Notifications</TabsTrigger>
					</TabsList>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<TabsContent value="account" className="space-y-6 pt-6">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center gap-2">
												<Mail size={16} />
												Email Address
											</FormLabel>
											<FormControl>
												<Input {...field} placeholder="your@email.com" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="currentPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="flex items-center gap-2">
												<Lock size={16} />
												Current Password
											</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="password"
													placeholder="••••••••"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="newPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>New Password</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="password"
													placeholder="••••••••"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Confirm New Password</FormLabel>
											<FormControl>
												<Input
													{...field}
													type="password"
													placeholder="••••••••"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</TabsContent>

							<TabsContent value="notifications" className="space-y-6 pt-6">
								<FormField
									control={form.control}
									name="emailNotifications"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="flex items-center gap-2">
													<Mail size={16} />
													Email Notifications
												</FormLabel>
												<p className="text-sm text-muted-foreground">
													Receive notifications via email
												</p>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="pushNotifications"
									render={({ field }) => (
										<FormItem className="flex items-center justify-between rounded-lg border p-4">
											<div className="space-y-0.5">
												<FormLabel className="flex items-center gap-2">
													<Bell size={16} />
													Push Notifications
												</FormLabel>
												<p className="text-sm text-muted-foreground">
													Receive push notifications
												</p>
											</div>
											<FormControl>
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</TabsContent>

							<div className="flex justify-end pt-6">
								<Button type="submit" disabled={isLoading}>
									{isLoading ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						</form>
					</Form>
				</Tabs>
			</div>
		</div>
	);
}
