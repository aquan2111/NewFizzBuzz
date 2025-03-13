import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EditQuizPage from "../pages/EditQuizPage";
import { getQuizById, updateQuiz } from "../services/QuizService";
import { Quiz } from "../types/Quiz";

// Mock the services
jest.mock("../services/QuizService", () => ({
    getQuizById: jest.fn(),
    updateQuiz: jest.fn(),
}));

const mockQuiz: Quiz = {
    id: 1,
    authorId: 1,
    title: "Sample Quiz",
    rules: [
        { id: 1, divisor: 3, word: "Fizz" },
        { id: 2, divisor: 5, word: "Buzz" },
    ],
};

// Helper function to render component with router
const renderWithRouter = (quizId: string) => {
    return render(
        <MemoryRouter initialEntries={[`/edit-quiz/${quizId}`]}>
            <Routes>
                <Route path="/edit-quiz/:quizId" element={<EditQuizPage />} />
                <Route path="/quizzes" element={<div>Quizzes Page</div>} /> 
            </Routes>
        </MemoryRouter>
    );
};

describe("EditQuizPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders loading state initially", async () => {
        (getQuizById as jest.Mock).mockResolvedValue(mockQuiz);

        renderWithRouter("1");

        expect(screen.getByText("Loading...")).toBeInTheDocument();

        expect(await screen.findByDisplayValue(mockQuiz.title)).toBeInTheDocument();
    });

    test("loads quiz data and displays it", async () => {
        (getQuizById as jest.Mock).mockResolvedValue(mockQuiz);

        renderWithRouter("1");

        expect(await screen.findByDisplayValue("Sample Quiz")).toBeInTheDocument();
        expect(await screen.findAllByLabelText("Divisor")).toHaveLength(2);
        expect(await screen.findAllByLabelText("Word")).toHaveLength(2);
    });

    test("updates title input", async () => {
        (getQuizById as jest.Mock).mockResolvedValue(mockQuiz);

        renderWithRouter("1");

        const titleInput = await screen.findByDisplayValue("Sample Quiz");
        fireEvent.change(titleInput, { target: { value: "Updated Quiz" } });

        expect(screen.getByDisplayValue("Updated Quiz")).toBeInTheDocument();
    });

    test("adds a new rule", async () => {
        (getQuizById as jest.Mock).mockResolvedValue(mockQuiz);

        renderWithRouter("1");

        await screen.findByText("Rules");

        fireEvent.click(screen.getByRole("button", { name: /add rule/i }));

        const divisorInputs = screen.getAllByLabelText("Divisor");
        const wordInputs = screen.getAllByLabelText("Word");

        expect(divisorInputs).toHaveLength(3);
        expect(wordInputs).toHaveLength(3);
    });

    test("removes a rule", async () => {
        (getQuizById as jest.Mock).mockResolvedValue(mockQuiz);

        renderWithRouter("1");

        await screen.findByText("Rules");

        fireEvent.click(screen.getAllByRole("button", { name: /remove rule/i })[0]);

        expect(screen.getAllByLabelText("Divisor")).toHaveLength(1);
        expect(screen.getAllByLabelText("Word")).toHaveLength(1);
    });

    test("updates quiz on submit", async () => {
        (getQuizById as jest.Mock).mockResolvedValue(mockQuiz);
        (updateQuiz as jest.Mock).mockResolvedValue(undefined);

        renderWithRouter("1");

        await screen.findByDisplayValue("Sample Quiz");

        fireEvent.click(screen.getByRole("button", { name: /update quiz/i }));

        expect(updateQuiz).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                title: "Sample Quiz",
                rules: expect.arrayContaining([
                    expect.objectContaining({ divisor: 3, word: "Fizz" }),
                    expect.objectContaining({ divisor: 5, word: "Buzz" }),
                ]),
            })
        );

        expect(await screen.findByText("Quizzes Page")).toBeInTheDocument();
    });

    test("handles API errors gracefully", async () => {
        (getQuizById as jest.Mock).mockRejectedValue(new Error("Network error"));
    
        renderWithRouter("1");
    
        await waitFor(() => {
            expect(screen.getByText("Failed to fetch quiz")).toBeInTheDocument();
        });
    });
    
});
