import {create} from "zustand";

import type {AuthUser, LoginResponse} from "@/features/auth/types/auth";

type AuthState = {
    user: AuthUser | null;
    token: string | null;
    setSession: (payload: LoginResponse) => void;
    clearSession: () => void;
    hydrate: () => void;
};

const readStoredUser = (): AuthUser | null => {
    const serialized = localStorage.getItem("rr_user");
    if (!serialized) {
        return null;
    }
    try {
        return JSON.parse(serialized);
    } catch {
        localStorage.removeItem("rr_user");
        return null;
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    setSession: ({token, user}) => {
        localStorage.setItem("rr_token", token);
        if (user) {
            localStorage.setItem("rr_user", JSON.stringify(user));
        } else {
            localStorage.removeItem("rr_user");
        }
        set({token, user: user ?? null});
    },
    clearSession: () => {
        localStorage.removeItem("rr_token");
        localStorage.removeItem("rr_user");
        set({user: null, token: null});
    },
    hydrate: () => {
        const token = localStorage.getItem("rr_token");
        set({
            token: token ?? null,
            user: readStoredUser(),
        });
    },
}));
