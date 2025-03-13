import { useEffect, useState } from "react";
import { Quiz } from "../types/Quiz";
import { getAllQuizzes, getUserQuizzes, deleteQuiz } from "../services/QuizService";
import QuizCard from "../components/QuizCard";
import { useNavigate } from "react-router-dom";
import { jwtDecode, JwtPayload } from "jwt-decode";
import "../styles/styles.css";

const QuizzesPage = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [showMyQuizzes, setShowMyQuizzes] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const quizzesPerPage = 5;
    const navigate = useNavigate();

    // Function to extract userId from JWT token
    const getUserIdFromToken = (): number | null => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
            const decodedToken = jwtDecode<JwtPayload & { UserId: number }>(token);
            return decodedToken.UserId || null;
        } catch (error) {
            console.error("Error decoding token:", error);
            return null;
        }
    };

    const userId = getUserIdFromToken(); // Get userId from token

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const data = showMyQuizzes
                    ? userId !== null ? await getUserQuizzes(userId) : [] // Avoid API call if userId is null
                    : await getAllQuizzes();
                setQuizzes(data);
            } catch (error) {
                console.error("Error fetching quizzes:", error);
            }
        };

        fetchQuizzes();
    }, [showMyQuizzes, userId]); // Re-fetch when userId or tab state changes

    const handleDelete = async (quizId: number) => {
        await deleteQuiz(quizId);
        setQuizzes(quizzes.filter(q => q.id !== quizId));
    };

    // Navigation functions
    const handleEdit = (quizId: number) => {
        navigate(`/edit-quiz/${quizId}`);
    };

    const handleHistory = (quizId: number) => {
        navigate(`/history/${quizId}`);
    };

    const handlePlay = (quizId: number) => {
        navigate(`/quiz/${quizId}/start`);
    };

    // Calculate the quizzes to display on the current page
    const indexOfLastQuiz = currentPage * quizzesPerPage;
    const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
    const currentQuizzes = quizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);

    // Pagination Controls
    const totalPages = Math.ceil(quizzes.length / quizzesPerPage);
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="quizzes-page">
            <h2>Quizzes</h2>
            <button onClick={() => setShowMyQuizzes(!showMyQuizzes)}>
                {showMyQuizzes ? "Show All Quizzes" : "Show My Quizzes"}
            </button>
            {showMyQuizzes && (
                <button onClick={() => navigate("/create-quiz")}>Create Quiz</button>
            )}
            <div className="quiz-list">
                {currentQuizzes.map(quiz => (
                    <QuizCard 
                        key={quiz.id} 
                        quiz={quiz} 
                        isMyQuiz={showMyQuizzes} 
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onHistory={handleHistory}
                        onPlay={handlePlay}
                    />
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="pagination-controls">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default QuizzesPage;
