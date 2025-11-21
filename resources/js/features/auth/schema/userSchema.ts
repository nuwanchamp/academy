import {z} from "zod";

export const userSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.email(),
    role: z.string(),
    preferred_locale: z.string(),
    timezone: z.string(),
    is_active: z.boolean(),
    last_login_at: z.string(),
});
