import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import QuizCard from "../components/QuizCard";
import { Quiz } from "../types/Quiz";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("QuizCard Component", () => {
  const mockQuiz: Quiz = {
    id: 1,
    authorId: 1,
    title: "Sample Quiz",
    rules: [
      { id: 1, divisor: 3, word: "Fizz" },
      { id: 2, divisor: 5, word: "Buzz" },
    ],
  };

  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnHistory = jest.fn();
  const mockOnPlay = jest.fn();

  it("renders quiz details correctly", () => {
    render(
      <MemoryRouter>
        <QuizCard
          quiz={mockQuiz}
          isMyQuiz={false}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onHistory={mockOnHistory}
          onPlay={mockOnPlay}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Sample Quiz")).toBeInTheDocument();
    expect(screen.getByText("Rules: 3: Fizz, 5: Buzz")).toBeInTheDocument();
  });

  it("navigates to play quiz page when 'Play' button is clicked", () => {
    render(
      <MemoryRouter>
        <QuizCard
          quiz={mockQuiz}
          isMyQuiz={false}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onHistory={mockOnHistory}
          onPlay={mockOnPlay}
        />
      </MemoryRouter>
    );

    const playButton = screen.getByText("Play");
    fireEvent.click(playButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/quiz/${mockQuiz.id}/play`);
  });

  it("navigates to quiz history page when 'History' button is clicked", () => {
    render(
      <MemoryRouter>
        <QuizCard
          quiz={mockQuiz}
          isMyQuiz={false}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onHistory={mockOnHistory}
          onPlay={mockOnPlay}
        />
      </MemoryRouter>
    );

    const historyButton = screen.getByText("History");
    fireEvent.click(historyButton);

    expect(mockNavigate).toHaveBeenCalledWith(`/quiz/${mockQuiz.id}/history`);
  });

  it("displays 'Edit' and 'Delete' buttons when 'isMyQuiz' is true", () => {
    render(
      <MemoryRouter>
        <QuizCard
          quiz={mockQuiz}
          isMyQuiz={true}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onHistory={mockOnHistory}
          onPlay={mockOnPlay}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("calls onDelete when 'Delete' button is clicked", () => {
    render(
      <MemoryRouter>
        <QuizCard
          quiz={mockQuiz}
          isMyQuiz={true}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onHistory={mockOnHistory}
          onPlay={mockOnPlay}
        />
      </MemoryRouter>
    );

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockQuiz.id);
  });

  it("does not display 'Edit' and 'Delete' buttons when 'isMyQuiz' is false", () => {
    render(
      <MemoryRouter>
        <QuizCard
          quiz={mockQuiz}
          isMyQuiz={false}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onHistory={mockOnHistory}
          onPlay={mockOnPlay}
        />
      </MemoryRouter>
    );

    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });
});
