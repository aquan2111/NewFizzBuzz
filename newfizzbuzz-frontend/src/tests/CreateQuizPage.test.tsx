import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateQuizPage from "../pages/CreateQuizPage";
import * as QuizService from "../services/QuizService"; // Mock service
import { BrowserRouter as Router } from "react-router-dom";

jest.mock("../services/QuizService"); // Mock the QuizService

describe("CreateQuizPage", () => {
    it("renders the Create Quiz page", () => {
        render(
            <Router>
                <CreateQuizPage />
            </Router>
        );

        // Check if the page contains 'Create Quiz' header
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Create Quiz");

        // Check if the input for Quiz Title is rendered
        expect(screen.getByPlaceholderText("Quiz Title")).toBeInTheDocument();

        // Check if the Add Rule button is present
        expect(screen.getByText("Add Rule")).toBeInTheDocument();
    });

    it("displays an error message when title or rules are missing", async () => {
        render(
            <Router>
                <CreateQuizPage />
            </Router>
        );

        // Simulate the form submission with missing fields
        fireEvent.click(screen.getByRole("button", { name: "Create Quiz" }));

        // Wait for the error message to appear
        await waitFor(() => {
            expect(screen.getByText("Title and at least one rule are required.")).toBeInTheDocument();
        });
    });

    it("can add and remove rules", () => {
        render(
            <Router>
                <CreateQuizPage />
            </Router>
        );

        // Click the "Add Rule" button to add a rule
        fireEvent.click(screen.getByText("Add Rule"));

        // Check if the RuleInput for the new rule is displayed
        expect(screen.getAllByPlaceholderText("Divisor").length).toBe(1);

        // Remove the rule
        fireEvent.click(screen.getByText("Remove"));

        // Check if the rule has been removed
        expect(screen.queryAllByPlaceholderText("Divisor").length).toBe(0);
    });

    it("successfully creates a quiz", async () => {
        const mockCreateQuiz = jest.spyOn(QuizService, "createQuiz").mockResolvedValueOnce(undefined);
        
        render(
            <Router>
                <CreateQuizPage />
            </Router>
        );

        // Fill in the quiz title
        fireEvent.change(screen.getByPlaceholderText("Quiz Title"), { target: { value: "New FizzBuzz Quiz" } });

        // Add a rule
        fireEvent.click(screen.getByText("Add Rule"));

        // Submit the form
        fireEvent.click(screen.getByRole("button", { name: "Create Quiz" }));

        // Wait for the quiz creation to be completed
        await waitFor(() => expect(mockCreateQuiz).toHaveBeenCalledTimes(1));
        
        // Check the arguments passed to the createQuiz function
        await waitFor(() => {
            expect(mockCreateQuiz).toHaveBeenCalledWith({
                title: "New FizzBuzz Quiz",
                rules: expect.arrayContaining([
                    expect.objectContaining({
                        divisor: 3,
                        word: "Fizz",
                    }),
                ]),
                authorId: expect.any(Number),
            });
        });
    });

    it("displays an error message if quiz creation fails", async () => {
        const mockCreateQuiz = jest.spyOn(QuizService, "createQuiz").mockRejectedValueOnce(new Error("Failed to create quiz"));

        render(
            <Router>
                <CreateQuizPage />
            </Router>
        );

        // Fill in the quiz title
        fireEvent.change(screen.getByPlaceholderText("Quiz Title"), { target: { value: "New FizzBuzz Quiz" } });

        // Add a rule
        fireEvent.click(screen.getByText("Add Rule"));

        // Submit the form
        fireEvent.click(screen.getByRole("button", { name: "Create Quiz" }));

        // Wait for the error message to appear
        await waitFor(() => {
            expect(screen.getByText("Failed to create quiz")).toBeInTheDocument();
        });
    });
});
