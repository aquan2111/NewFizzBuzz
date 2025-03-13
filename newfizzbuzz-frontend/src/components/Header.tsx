import { Link, useNavigate } from "react-router-dom";
import { User } from "../types/User";
import "../styles/styles.css";

interface HeaderProps {
    user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.dispatchEvent(new Event("storage")); // 🔥 Ensure App.tsx updates user
        navigate("/auth");
    };

    return (
        <header className="header">
            <h1>NewFizzBuzz</h1>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/quizzes">Quizzes</Link>
                {user ? (
                    <>
                        <Link to={`/profile/${user.id}`}>Profile</Link>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <Link to="/auth">Login</Link>
                )}
            </nav>
        </header>
    );
};

export default Header;
