import {z} from "zod";

import {credentialsSchema} from "@/features/auth/schema/credentialsSchema.ts";
import {userSchema} from "@/features/auth/schema/userSchema.ts";
import type {Credentials, LoginResponse} from "@/features/auth/types/auth";
import api from "@/lib/api_client.ts";

const forgotSchema = z.object({
    email: z.string().email("Please enter a valid email address."),
});

export const authApi = {
    async login(payload: Credentials): Promise<LoginResponse> {
        const parsed = credentialsSchema.safeParse(payload);
        if (!parsed.success) {
            throw parsed.error;
        }

        const {data} = await api.post<LoginResponse>("/login", parsed.data);
        const user = data.user ? userSchema.parse(data.user) : undefined;

        return {
            ...data,
            user,
        };
    },

    async requestPasswordReset(email: string): Promise<void> {
        const {email: validatedEmail} = forgotSchema.parse({email});
        await api.post("/password/forgot", {email: validatedEmail});
    },
};
