import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuizzesPage from "./pages/QuizzesPage";
import CreateQuizPage from "./pages/CreateQuizPage";
import PlayQuizPage from "./pages/PlayQuizPage";
import QuizHistoryPage from "./pages/QuizHistoryPage";
import AttemptDetailsPage from "./pages/AttemptDetailsPage";
import AuthPage from "./pages/AuthPage";
import EditQuizPage from "./pages/EditQuizPage";
import ProfilePage from "./pages/ProfilePage";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/create-quiz" element={<CreateQuizPage />} />
            <Route path="/quiz/:quizId/edit" element={<EditQuizPage />} />
            <Route path="/quiz/:quizId/play" element={<PlayQuizPage />} />
            <Route path="/quiz/:quizId/history" element={<QuizHistoryPage />} />
            <Route path="/history/:quizId" element={<QuizHistoryPage />} />
            <Route path="/attempt/:attemptId" element={<AttemptDetailsPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/auth" element={<AuthPage />} />
        </Routes>
    );
};

export default AppRoutes;
