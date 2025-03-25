import { z } from "zod";

export const settingsSchema = z
	.object({
		email: z.string().email({
			message: "Please enter a valid email address.",
		}),
		currentPassword: z
			.string()
			.min(8, {
				message: "Password must be at least 8 characters.",
			})
			.optional(),
		newPassword: z
			.string()
			.min(8, {
				message: "Password must be at least 8 characters.",
			})
			.optional(),
		confirmPassword: z
			.string()
			.min(8, {
				message: "Password must be at least 8 characters.",
			})
			.optional(),
		emailNotifications: z.boolean(),
		pushNotifications: z.boolean(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
