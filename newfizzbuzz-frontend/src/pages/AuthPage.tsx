import { useState } from "react";
import { loginUser, registerUser } from "../services/AuthService";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false); // Toggle between login/register
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null); // Clear previous errors

        try {
            if (isRegister) {
                // Register new user
                await registerUser(email, password);
                alert("Registration successful. Please log in.");
                setIsRegister(false); // Switch to login mode
            } else {
                // Login existing user
                const token = await loginUser(email, password);

                if (!token) {
                    throw new Error("No token received.");
                }

                localStorage.setItem("token", token); // Store auth token
                console.log("Stored token:", localStorage.getItem("token")); // Debugging

                navigate("/quizzes"); // Redirect to quizzes page after login
            }
        } catch (err) {
            console.error("Authentication error:", err);
            setError("Authentication failed. Please check your credentials.");
        }
    };

    return (
        <div style={{ textAlign: "center", maxWidth: "400px", margin: "auto" }}>
            <h2>{isRegister ? "Register" : "Login"}</h2>
            
            {error && <p style={{ color: "red" }}>{error}</p>}
            
            <form onSubmit={handleAuth}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input 
                        id="email" // Add this
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input 
                        id="password" // Add this
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                
                <button type="submit">{isRegister ? "Register" : "Login"}</button>
            </form>


            <p>
                {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                <button onClick={() => setIsRegister(!isRegister)}>
                    {isRegister ? "Login" : "Register"}
                </button>
            </p>
        </div>
    );
};

export default AuthPage;
