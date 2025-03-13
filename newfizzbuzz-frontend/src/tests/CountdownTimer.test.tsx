import { render, screen, act } from "@testing-library/react";
import CountdownTimer from "../components/CountdownTimer";

describe("CountdownTimer Component", () => {
  beforeEach(() => {
    jest.useFakeTimers(); // Mock timers
  });

  afterEach(() => {
    jest.useRealTimers(); // Restore real timers
  });

  it("renders initial countdown value", () => {
    render(<CountdownTimer onComplete={jest.fn()} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("counts down to zero and calls onComplete", () => {
    const mockOnComplete = jest.fn();
    render(<CountdownTimer onComplete={mockOnComplete} />);

    act(() => {
      jest.advanceTimersByTime(1000); // Simulate 1 second
    });
    expect(screen.getByText("2")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText("1")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText("0")).toBeInTheDocument();

    // After reaching 0, onComplete should be called
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });
});
