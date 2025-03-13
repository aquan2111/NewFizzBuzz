import { render, screen, fireEvent } from "@testing-library/react";
import RuleInput from "../components/RuleInput";
import { Rule } from "../types/Rule";

describe("RuleInput Component", () => {
  const mockOnChange = jest.fn();
  const mockOnRemove = jest.fn();

  const rule: Rule = {
    id: 1,
    divisor: 3,
    word: "Fizz",
  };

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnRemove.mockClear();
  });

  it("renders correctly with provided rule", () => {
    render(<RuleInput rule={rule} onChange={mockOnChange} onRemove={mockOnRemove} />);

    expect(screen.getByPlaceholderText("Divisor")).toHaveValue(rule.divisor);
    expect(screen.getByPlaceholderText("Word")).toHaveValue(rule.word);
  });

  it("calls onChange when divisor is updated", () => {
    render(<RuleInput rule={rule} onChange={mockOnChange} onRemove={mockOnRemove} />);

    const divisorInput = screen.getByPlaceholderText("Divisor");

    fireEvent.change(divisorInput, { target: { value: "5" } });

    expect(mockOnChange).toHaveBeenCalledWith({ ...rule, divisor: 5 });
  });

  it("calls onChange when word is updated", () => {
    render(<RuleInput rule={rule} onChange={mockOnChange} onRemove={mockOnRemove} />);

    const wordInput = screen.getByPlaceholderText("Word");

    fireEvent.change(wordInput, { target: { value: "Buzz" } });

    expect(mockOnChange).toHaveBeenCalledWith({ ...rule, word: "Buzz" });
  });

  it("calls onRemove when Remove button is clicked", () => {
    render(<RuleInput rule={rule} onChange={mockOnChange} onRemove={mockOnRemove} />);

    const removeButton = screen.getByText("Remove");

    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalled();
  });
});
