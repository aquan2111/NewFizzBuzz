import { render, screen } from "@testing-library/react";
import QuizHistoryPage from "../pages/QuizHistoryPage";
import { getUserAttemptsForQuiz } from "../services/AttemptService";
import { getUserIdFromToken } from "../utils/Auth";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Attempt } from "../types/Attempt";
import userEvent from "@testing-library/user-event";
import { Quiz } from "../types/Quiz";

jest.mock("../services/AttemptService");
jest.mock("../utils/Auth");

const mockQuiz: Quiz = {
    id: 101,
    title: "Sample Quiz",
    rules: [{ id: 1, divisor: 3, word: "Fizz" }, { id: 2, divisor: 5, word: "Buzz" }],
    authorId: 1
};

// Formatted dates as expected in the UI
const formattedDate1 = new Date("2024-03-10T10:00:00Z").toLocaleString();
const formattedDate2 = new Date("2024-03-14T14:00:00Z").toLocaleString();

const mockAttempts: Attempt[] = [
    { id: 1, userId: 1, quizId: 101, quiz: mockQuiz, attemptedAt: "2024-03-10T10:00:00Z", correctCount: 8, totalQuestions: 10, timeLimit: 60, attemptAnswers: [] },
    { id: 5, userId: 1, quizId: 101, quiz: mockQuiz, attemptedAt: "2024-03-14T14:00:00Z", correctCount: 10, totalQuestions: 10, timeLimit: 60, attemptAnswers: [] },
];

describe("QuizHistoryPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders quiz history with attempts", async () => {
        (getUserIdFromToken as jest.Mock).mockReturnValue(1);
        (getUserAttemptsForQuiz as jest.Mock).mockResolvedValue(mockAttempts);
    
        render(
            <MemoryRouter initialEntries={["/quiz/101/history"]}>
                <Routes>
                    <Route path="/quiz/:quizId/history" element={<QuizHistoryPage />} />
                </Routes>
            </MemoryRouter>
        );
    
        expect(await screen.findByText("Quiz History")).toBeInTheDocument();
    
        // Use function matchers to find elements containing the expected date
        expect(await screen.findByText((content) => content.includes(formattedDate1))).toBeInTheDocument();
        expect(await screen.findByText((content) => content.includes(formattedDate2))).toBeInTheDocument();
    
        expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    });
    

    test("shows 'No attempts found' when no attempts exist", async () => {
        (getUserIdFromToken as jest.Mock).mockReturnValue(1);
        (getUserAttemptsForQuiz as jest.Mock).mockResolvedValue([]);

        render(
            <MemoryRouter initialEntries={["/quiz/101/history"]}>
                <Routes>
                    <Route path="/quiz/:quizId/history" element={<QuizHistoryPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText("No attempts found for this quiz.")).toBeInTheDocument();
    });

    test("navigates to next page on clicking 'Next'", async () => {
        (getUserIdFromToken as jest.Mock).mockReturnValue(1);

        // Generate more than 5 attempts to enable pagination
        const largeMockAttempts = Array.from({ length: 7 }, (_, i) => ({
            id: i + 1,
            userId: 1,
            quizId: 101,
            quiz: mockQuiz,
            attemptedAt: new Date().toISOString(),
            correctCount: 5,
            totalQuestions: 10,
            timeLimit: 60,
            attemptAnswers: [],
        }));

        (getUserAttemptsForQuiz as jest.Mock).mockResolvedValue(largeMockAttempts);

        render(
            <MemoryRouter initialEntries={["/quiz/101/history"]}>
                <Routes>
                    <Route path="/quiz/:quizId/history" element={<QuizHistoryPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText("Quiz History")).toBeInTheDocument();
        
        // Wait for pagination
        const nextButton = await screen.findByRole("button", { name: /Next/i });
        expect(nextButton).not.toBeDisabled();

        // Click the Next button
        await userEvent.click(nextButton);

        // Verify we are on page 2
        expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    });
});
