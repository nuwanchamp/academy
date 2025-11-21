import {z} from "zod";

export const credentialsSchema = z.object({
    identifier: z.string().min(1, "Email or username is required"),
    // password: z.string().min(8, "Password must be at least 8 characters"),
    password: z.string()
});

