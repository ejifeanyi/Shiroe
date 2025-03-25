import { z } from "zod";

export const profileSchema = z.object({
	name: z.string().min(2, {
		message: "Name must be at least 2 characters.",
	}),
	bio: z
		.string()
		.max(500, {
			message: "Bio must not be longer than 500 characters.",
		})
		.optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
