import { User } from "../types/User";
import { Api } from "./Api";

// Register a new user with separate email and password arguments
export const registerUser = async (email: string, password: string): Promise<User> => {
    try {
        const userData: Omit<User, 'id'> = { email, password }; // Create the user data object
        const response = await Api.post("/auth/register", userData);
        return response.data;
    } catch (error) {
        throw new Error("Error registering user.");
    }
};

// Login an existing user
export const loginUser = async (email: string, password: string): Promise<string> => {
    try {
        const response = await Api.post("/auth/login", { email, password });
        console.log("Login Response:", response.data);
        
        localStorage.setItem("token", response.data.token); // Store token
        localStorage.setItem("userId", response.data.userId); // Store userId
        window.dispatchEvent(new Event("storage")); // 🔥 Force App.tsx to re-fetch user

        return response.data.token;
    } catch (error) {
        throw new Error("Error logging in.");
    }
};


// Get user profile by ID
export const getUserProfile = async (userId: number): Promise<User> => {
    try {
        const response = await Api.get(`/user/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error("Error fetching user profile.");
    }
};
