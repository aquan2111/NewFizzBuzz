import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import AttemptCard from "../components/AttemptCard";
import { Attempt } from "../types/Attempt";

// Mock useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual<typeof import("react-router-dom")>("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("AttemptCard Component", () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate); // Type-safe mock
  });

  const mockAttempt: Attempt = {
    id: 123,
    userId: 1,
    quizId: 456,
    quiz: {
      id: 456,
      title: "FizzBuzz Quiz",
      authorId: 1,
      rules: [],
    },
    attemptedAt: "2024-03-12T12:00:00Z",
    correctCount: 8,
    totalQuestions: 10,
    timeLimit: 300,
    attemptAnswers: [],
  };

  it("renders attempt details correctly", () => {
    jest.spyOn(global.Date.prototype, "toLocaleString").mockReturnValue("3/12/2024, 12:00:00 PM");
  
    render(
      <MemoryRouter>
        <AttemptCard attempt={mockAttempt} />
      </MemoryRouter>
    );
  
    expect(screen.getByText("Date: 3/12/2024, 12:00:00 PM")).toBeInTheDocument();
    expect(screen.getByText("Score: 8/10")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /view attempt/i })).toBeInTheDocument();
  });  

  it("navigates to the correct attempt details page on button click", async () => {
    render(
      <MemoryRouter>
        <AttemptCard attempt={mockAttempt} />
      </MemoryRouter>
    );

    const viewButton = screen.getByRole("button", { name: /view attempt/i });
    await userEvent.click(viewButton);

    expect(mockNavigate).toHaveBeenCalledWith("/attempt/123");
  });
});
