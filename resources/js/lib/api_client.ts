import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("rr_token") : null;
    if (token) {
        config.headers = config.headers ?? {};
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    const csrfToken = Cookies.get("XSRF-TOKEN");
    if (csrfToken) {
        config.headers = config.headers ?? {};
        config.headers["X-XSRF-TOKEN"] = csrfToken;
    }

    return config;
});

export default api;
