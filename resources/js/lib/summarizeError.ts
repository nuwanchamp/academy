import axios from "axios";

export const summarizeError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const responseMessage = error.response?.data?.message;
        const validationErrors = error.response?.data?.errors;

        if (validationErrors) {
            const firstKey = Object.keys(validationErrors)[0];
            if (firstKey) {
                return validationErrors[firstKey][0];
            }
        }

        if (typeof responseMessage === "string") {
            return responseMessage;
        }
    }

    return "Something went wrong. Please try again.";
};

