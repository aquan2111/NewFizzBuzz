import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserProfile } from "../services/AuthService";
import { getUserQuizzes } from "../services/QuizService";
import { getUserAttempts } from "../services/AttemptService";
import { getQuizById } from "../services/QuizService";
import { User } from "../types/User";
import { Quiz } from "../types/Quiz";
import { Attempt } from "../types/Attempt";
import "../styles/styles.css";

const ProfilePage = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [quizTitles, setQuizTitles] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            try {
                const userProfile = await getUserProfile(Number(userId));
                setUser(userProfile);

                const userQuizzes = await getUserQuizzes(Number(userId));
                setQuizzes(userQuizzes);

                const userAttempts = await getUserAttempts(Number(userId));
                setAttempts(userAttempts);

                // Fetch quiz titles for attempts
                const titlesMap: { [key: number]: string } = {};
                await Promise.all(userAttempts.map(async (attempt) => {
                    const quiz = await getQuizById(attempt.quizId);
                    titlesMap[attempt.quizId] = quiz.title;
                }));
                setQuizTitles(titlesMap);

            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };

        fetchData();
    }, [userId]);

    return (
        <div className="profile-page">
            <h2>User Profile</h2>
            {user ? (
                <div>
                    <p><strong>Email:</strong> {user.email}</p>
                    <h3>Quizzes Created</h3>
                    {quizzes.length > 0 ? (
                        <ul>
                            {quizzes.map((quiz) => (
                                <li key={quiz.id}>
                                    <Link to={`/quiz/${quiz.id}`}>{quiz.title}</Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No quizzes created.</p>
                    )}

                    <h3>Quiz Attempts</h3>
                    {attempts.length > 0 ? (
                        <ul>
                            {attempts.map((attempt) => (
                                <li key={attempt.id}>
                                    <Link to={`/attempt/${attempt.id}`}>
                                        {quizTitles[attempt.quizId] || "Loading..."} - Score: {attempt.correctCount}/{attempt.totalQuestions}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No quiz attempts found.</p>
                    )}
                </div>
            ) : (
                <p>Loading user data...</p>
            )}
        </div>
    );
};

export default ProfilePage;
