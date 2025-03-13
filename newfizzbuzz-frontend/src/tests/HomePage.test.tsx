import { render, screen } from "@testing-library/react";
import HomePage from "../pages/HomePage";

describe("HomePage", () => {
    it("renders the homepage with welcome message and description", () => {
        render(<HomePage />);

        // Check if the welcome heading is rendered
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Welcome to NewFizzBuzz!");

        // Check if the description paragraph is rendered
        expect(screen.getByText(/Challenge yourself with unique FizzBuzz-style quizzes!/)).toBeInTheDocument();
    });
});
