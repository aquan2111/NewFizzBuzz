import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios"; // Import the correct type

export const Api = axios.create({
    baseURL: "https://localhost:8080/api", // Ensure this matches your backend URL
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token dynamically to requests
Api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token) {
        // Use `set` method to modify headers properly in Axios v1.3+
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});
