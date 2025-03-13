import { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AppRoutes from "./routes";
import { getUserIdFromToken } from "./utils/Auth";
import { getUserProfile } from "./services/AuthService";
import { User } from "./types/User";
import "./styles/styles.css";

// Create a component for the app content without the router
export const AppContent: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);  // New state to handle errors

    // Function to load user data
    // Function to load user data
    const loadUser = async () => {
        const userId = getUserIdFromToken();

        if (!userId) {
            // No token, so user is not logged in
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const userProfile = await getUserProfile(userId);
            setUser(userProfile);
            setError(null); // Reset error if successful
        } catch (error: any) {
            console.error("Error fetching user profile:", error);

            // Handle 401 (Unauthorized) specifically
            if (error.response && error.response.status === 401) {
                setError("Session expired. Please log in again.");
            } else {
                setError("Failed to load user profile. Please try again later.");
            }

            setUser(null); // Reset user state on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser(); // Initial load

        // Listen for localStorage changes (e.g., login/logout)
        const handleStorageChange = () => {
            loadUser();
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Header user={user} />
            <div className="content">
                {error ? (
                    <div>{error}</div>  // Display the error message if there's an issue
                ) : (
                    <AppRoutes />
                )}
            </div>
            <Footer />
        </>
    );
};

// Main App component that includes the router
const App: React.FC = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;