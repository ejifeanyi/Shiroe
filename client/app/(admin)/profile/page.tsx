"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Edit, Save, Upload, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { toast } from "sonner";
import { profileSchema, ProfileFormValues } from "@/lib/profile";

interface User {
	name: string;
	email: string;
	bio?: string;
	profile_picture_url?: string | null;
}

export default function ProfilePage() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const router = useRouter();

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: "",
			bio: "",
		},
	});

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const response = await axios.get("/api/v1/profile");
				setUser(response.data);
				form.reset({
					name: response.data.name || "",
					bio: response.data.bio || "",
				});
			} catch (error: Error | unknown) {
				const errorMessage =
					error instanceof Error ? error.message : "Failed to update profile";
				toast(errorMessage);
			} finally {
				setIsLoading(false);
			}
		};

		fetchProfile();
	}, [form, toast]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setSelectedFile(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleRemovePicture = async () => {
		try {
			await axios.put("/api/v1/profile", { remove_picture: true });
			if (user) {
				setUser({
					name: user.name,
					email: user.email,
					bio: user.bio,
					profile_picture_url: null
				});
			}
			setPreviewUrl(null);
			toast("Profile picture removed"
			);
		} catch (error: Error | unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to update profile picture";
			toast(errorMessage);
		}
	};

	const onSubmit = async (data: ProfileFormValues) => {
		try {
			const response = await axios.put("/api/v1/profile", data);
			setUser(response.data);
			setIsEditing(false);
			toast("Profile updated successfully");

			if (selectedFile) {
				const formData = new FormData();
				formData.append("file", selectedFile);
				await axios.post("/api/v1/profile/picture", formData, {
					headers: {
						"Content-Type": "multipart/form-data",
					},
				});
				setSelectedFile(null);
				// Refresh to get new picture URL
				router.refresh();
			}
        } catch (error: Error | unknown) {
                        const errorMessage =
                            error instanceof Error ? error.message : "Failed to update profile";
            toast(errorMessage);
		}
	};

	if (isLoading) return <div>Loading...</div>;

	return (
		<div className="container mx-auto py-8">
			<div className="max-w-3xl mx-auto bg-card rounded-lg shadow p-6">
				<div className="flex flex-col items-center mb-8">
					<Avatar className="w-32 h-32 mb-4">
						<AvatarImage
							src={previewUrl || user?.profile_picture_url || ""}
							alt={user?.name}
						/>
						<AvatarFallback>
							{user?.name
								?.split(" ")
								.map((n) => n[0])
								.join("")}
						</AvatarFallback>
					</Avatar>

					<div className="flex gap-2">
						<label htmlFor="profile-picture" className="cursor-pointer">
							<Button variant="outline" size="sm" asChild>
								<div className="flex items-center gap-2">
									<Upload size={16} />
									<span>Upload</span>
								</div>
							</Button>
							<input
								id="profile-picture"
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleFileChange}
							/>
						</label>

						{user?.profile_picture_url && (
							<Button
								variant="outline"
								size="sm"
								onClick={handleRemovePicture}
								className="flex items-center gap-2"
							>
								<Trash2 size={16} />
								<span>Remove</span>
							</Button>
						)}
					</div>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="flex items-center gap-2">
											<User size={16} />
											Name
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												disabled={!isEditing}
												placeholder="Your name"
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormItem>
								<FormLabel className="flex items-center gap-2">
									<Mail size={16} />
									Email
								</FormLabel>
								<Input value={user?.email} disabled placeholder="Your email" />
							</FormItem>
						</div>

						<FormField
							control={form.control}
							name="bio"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Bio</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											disabled={!isEditing}
											placeholder="Tell us about yourself"
											className="min-h-[100px]"
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-4">
							{isEditing ? (
								<>
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsEditing(false)}
									>
										Cancel
									</Button>
									<Button type="submit" className="flex items-center gap-2">
										<Save size={16} />
										Save Changes
									</Button>
								</>
							) : (
								<Button
									type="button"
									onClick={() => setIsEditing(true)}
									className="flex items-center gap-2"
								>
									<Edit size={16} />
									Edit Profile
								</Button>
							)}
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}
