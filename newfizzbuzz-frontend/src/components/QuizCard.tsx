import { Quiz } from "../types/Quiz";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css"; // Import styles

interface QuizCardProps {
    quiz: Quiz;
    isMyQuiz: boolean;
    onDelete: (quizId: number) => void;
    onEdit: (quizId: number) => void;
    onHistory: (quizId: number) => void;
    onPlay: (quizId: number) => void;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, isMyQuiz, onDelete }) => {
    const navigate = useNavigate();

    return (
        <div className="quiz-card">
            <h3>{quiz.title}</h3>
            <p>Rules: {quiz.rules.map(rule => `${rule.divisor}: ${rule.word}`).join(", ")}</p>

            <div className="quiz-card-buttons">
                <button onClick={() => navigate(`/quiz/${quiz.id}/play`)}>Play</button>
                <button onClick={() => navigate(`/quiz/${quiz.id}/history`)}>History</button>
                {isMyQuiz && (
                    <>
                        <button onClick={() => navigate(`/quiz/${quiz.id}/edit`)}>Edit</button>
                        <button onClick={() => onDelete && onDelete(quiz.id)}>Delete</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default QuizCard;
