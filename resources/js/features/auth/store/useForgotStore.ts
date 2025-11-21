import {create} from "zustand";

type ForgotStore = {
    forgotOpen: boolean;
    toggleForgot: () => void;
    setForgotOpen: (value: boolean) => void;
};

export const useForgotStore = create<ForgotStore>((set) => ({
    forgotOpen: false,
    toggleForgot: () => set((state) => ({forgotOpen: !state.forgotOpen})),
    setForgotOpen: (value) => set({forgotOpen: value}),
}));
