import { jwtDecode } from "jwt-decode";

// Define the expected structure of the JWT payload
interface JwtPayload {
    UserId: string; // Ensure key name matches backend claim
}

// Function to get userId from JWT token
export const getUserIdFromToken = (): number | null => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decodedToken = jwtDecode<JwtPayload>(token);
        if (!decodedToken.UserId) return null;
        
        const userId = parseInt(decodedToken.UserId);
        return !isNaN(userId) ? userId : null; // Return null if parsing results in NaN
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};
