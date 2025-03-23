"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowRight, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z
	.object({
		password: z
			.string()
			.min(8, {
				message: "Password must be at least 8 characters.",
			})
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
				message:
					"Password must contain at least one uppercase letter, one lowercase letter, and one number.",
			}),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export default function ResetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [token, setToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	useEffect(() => {
		const tokenParam = searchParams.get("token");
		if (!tokenParam) {
			setError("Invalid or missing reset token");
			return;
		}
		setToken(tokenParam);
	}, [searchParams]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (!token) {
			setError("Invalid or missing reset token");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(
				"http://localhost:8000/api/v1/auth/reset-password",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						token: token,
						new_password: values.password,
					}),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.detail || "Password reset failed");
			}

			setSuccess(true);
			toast.success("Password has been reset successfully");

			// Redirect to login page after a delay
			setTimeout(() => {
				router.push("/login");
			}, 3000);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "An unexpected error occurred"
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex items-center justify-center mb-2">
						<KeyRound className="h-10 w-10 text-primary" />
					</div>
					<CardTitle className="text-2xl font-bold text-center">
						Reset Password
					</CardTitle>
					<CardDescription className="text-center">
						Create a new password for your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive" className="mb-4">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{success ? (
						<Alert className="mb-4">
							<AlertDescription>
								Your password has been reset successfully. You will be
								redirected to the login page shortly.
							</AlertDescription>
						</Alert>
					) : (
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-4"
							>
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<FormLabel>New Password</FormLabel>
											<FormControl>
												<div className="relative">
													<Input
														type={showPassword ? "text" : "password"}
														placeholder="••••••••"
														disabled={isLoading}
														{...field}
													/>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="absolute right-0 top-0 h-full px-3"
														onClick={() => setShowPassword(!showPassword)}
													>
														{showPassword ? (
															<EyeOff className="h-4 w-4" />
														) : (
															<Eye className="h-4 w-4" />
														)}
														<span className="sr-only">
															{showPassword ? "Hide password" : "Show password"}
														</span>
													</Button>
												</div>
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
												<div className="relative">
													<Input
														type={showConfirmPassword ? "text" : "password"}
														placeholder="••••••••"
														disabled={isLoading}
														{...field}
													/>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="absolute right-0 top-0 h-full px-3"
														onClick={() =>
															setShowConfirmPassword(!showConfirmPassword)
														}
													>
														{showConfirmPassword ? (
															<EyeOff className="h-4 w-4" />
														) : (
															<Eye className="h-4 w-4" />
														)}
														<span className="sr-only">
															{showConfirmPassword
																? "Hide password"
																: "Show password"}
														</span>
													</Button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<Button
									type="submit"
									className="w-full"
									disabled={isLoading || !token}
								>
									{isLoading ? (
										<div className="flex items-center">
											<svg
												className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
											Resetting password...
										</div>
									) : (
										<div className="flex items-center">
											Reset password <ArrowRight className="ml-2 h-4 w-4" />
										</div>
									)}
								</Button>
							</form>
						</Form>
					)}
				</CardContent>
				<CardFooter className="flex flex-col items-center">
					<p className="mt-2 text-sm text-muted-foreground">
						Remember your password?{" "}
						<Button
							variant="link"
							className="p-0 h-auto font-medium"
							onClick={() => router.push("/login")}
						>
							Back to login
						</Button>
					</p>
				</CardFooter>
			</Card>
		</div>
	);
}
