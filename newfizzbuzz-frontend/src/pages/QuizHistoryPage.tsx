import { useEffect, useState } from "react";
import { Attempt } from "../types/Attempt";
import { getUserAttemptsForQuiz } from "../services/AttemptService";
import { useParams } from "react-router-dom";
import AttemptCard from "../components/AttemptCard";
import { getUserIdFromToken } from "../utils/Auth"; // Import the function to get userId from the token
import "../styles/styles.css";

const QuizHistoryPage = () => {
    const { quizId } = useParams();
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const attemptsPerPage = 5; // Number of attempts per page
    const userId = getUserIdFromToken(); // Get userId from the JWT token

    useEffect(() => {
        const fetchAttempts = async () => {
            if (!userId) {
                console.error("User ID is missing");
                return;
            }

            try {
                const attempts = await getUserAttemptsForQuiz(userId, Number(quizId)); // Ensure userId is valid
                setAttempts(attempts); // Set the attempts to state
            } catch (error) {
                console.error("Error fetching user attempts:", error);
            }
        };

        fetchAttempts();
    }, [quizId, userId]);

    // Slice the attempts based on the current page
    const indexOfLastAttempt = currentPage * attemptsPerPage;
    const indexOfFirstAttempt = indexOfLastAttempt - attemptsPerPage;
    const currentAttempts = attempts.slice(indexOfFirstAttempt, indexOfLastAttempt);

    // Pagination Controls
    const totalPages = Math.ceil(attempts.length / attemptsPerPage);
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="quiz-history-page">
            <h2>Quiz History</h2>
            <div className="attempt-list">
                {currentAttempts.length > 0 ? (
                    currentAttempts.map(attempt => (
                        <AttemptCard key={attempt.id} attempt={attempt} />
                    ))
                ) : (
                    <p>No attempts found for this quiz.</p>
                )}
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

export default QuizHistoryPage;
