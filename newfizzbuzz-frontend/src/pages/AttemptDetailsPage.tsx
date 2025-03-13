import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAttemptDetails } from "../services/AttemptService";
import { Attempt } from "../types/Attempt";
import { AttemptAnswer } from "../types/AttemptAnswer";

const AttemptDetailsPage = () => {
    const { attemptId } = useParams<{ attemptId: string }>(); // Get attemptId from URL

    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAttemptDetails = async () => {
            if (!attemptId) {
                setError("Invalid attempt ID.");
                setLoading(false);
                return;
            }

            try {
                const data = await getAttemptDetails(parseInt(attemptId));
                setAttempt(data);
            } catch (err) {
                setError("Error fetching attempt details.");
            } finally {
                setLoading(false);
            }
        };

        fetchAttemptDetails();
    }, [attemptId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!attempt) return <p>No attempt details found.</p>;

    // Filter out the questions where the user hasn't provided an answer
    const answeredQuestions = attempt.attemptAnswers.filter((answer: AttemptAnswer) => answer.answer);

    return (
        <div>
            <h2>Attempt Details</h2>
            <p><strong>Quiz:</strong> {attempt.quiz.title}</p>
            <p><strong>Attempted At:</strong> {new Date(attempt.attemptedAt).toLocaleString()}</p>
            <p><strong>Score:</strong> {attempt.correctCount} / {attempt.totalQuestions}</p>

            <h3>Answers</h3>
            {answeredQuestions.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Number</th>
                            <th>Your Answer</th>
                            <th>Correct Answer</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {answeredQuestions.map((answer: AttemptAnswer) => (
                            <tr key={answer.id}>
                                <td>{answer.quizQuestionId}</td>
                                <td>{answer.answer}</td>
                                <td>{answer.isCorrect ? "Correct" : "Wrong"}</td>
                                <td style={{ color: answer.isCorrect ? "green" : "red" }}>
                                    {answer.isCorrect ? "✔" : "✘"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No answers provided for this attempt.</p>
            )}
        </div>
    );
};

export default AttemptDetailsPage;
