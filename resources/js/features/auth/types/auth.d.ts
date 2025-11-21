import {z} from "zod";
import {credentialsSchema} from "@/features/auth/schema/credentialsSchema";
import {userSchema} from "@/features/auth/schema/userSchema";

export type Credentials = z.infer<typeof credentialsSchema>;

export type Feedback = {
    type: "success" | "error";
    message: string;
};
export type ForgotFeedback = Feedback;
export type LoginFeedback = Feedback;

export type AuthUser = z.infer<typeof userSchema>

export type LoginResponse = {
    token: string;
    user?: AuthUser;
};
