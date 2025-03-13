import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Header from "../components/Header";
import { User } from "../types/User";

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Header Component", () => {
  const mockUser: User = { id: 1, email: "test@example.com", password: "password123" };

  it("renders correctly when user is not logged in", () => {
    render(
      <MemoryRouter>
        <Header user={null} />
      </MemoryRouter>
    );

    expect(screen.getByText("NewFizzBuzz")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Quizzes")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders correctly when user is logged in", () => {
    render(
      <MemoryRouter>
        <Header user={mockUser} />
      </MemoryRouter>
    );

    expect(screen.getByText("NewFizzBuzz")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Quizzes")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("logs out and navigates to /auth when Logout button is clicked", () => {
    render(
      <MemoryRouter>
        <Header user={mockUser} />
      </MemoryRouter>
    );

    const logoutButton = screen.getByText("Logout");

    // Mock localStorage
    const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");

    fireEvent.click(logoutButton);

    expect(removeItemSpy).toHaveBeenCalledWith("token");
    expect(removeItemSpy).toHaveBeenCalledWith("userId");
    expect(mockNavigate).toHaveBeenCalledWith("/auth");

    removeItemSpy.mockRestore(); // Restore original localStorage behavior
  });
});
