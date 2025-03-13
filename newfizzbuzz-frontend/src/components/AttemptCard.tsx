import { Attempt } from "../types/Attempt";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css";

interface AttemptCardProps {
    attempt: Attempt;
}

const AttemptCard: React.FC<AttemptCardProps> = ({ attempt }) => {
    const navigate = useNavigate();

    return (
        <div className="attempt-card">
            <p>Date: {new Date(attempt.attemptedAt).toLocaleString()}</p>
            <p>Score: {attempt.correctCount}/{attempt.totalQuestions}</p>
            <button onClick={() => navigate(`/attempt/${attempt.id}`)}>View Attempt</button>
        </div>
    );
};

export default AttemptCard;
