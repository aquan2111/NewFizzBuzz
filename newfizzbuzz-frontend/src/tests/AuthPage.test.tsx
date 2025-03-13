import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "../pages/AuthPage";
import { loginUser, registerUser } from "../services/AuthService";

// Mock the authentication functions
jest.mock("../services/AuthService", () => ({
    loginUser: jest.fn(),
    registerUser: jest.fn(),
}));

describe("AuthPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Storage.prototype, "setItem"); // Spy on localStorage.setItem
        localStorage.clear();
    });

    test("renders login form initially", () => {
        render(
            <MemoryRouter>
                <AuthPage />
            </MemoryRouter>
        );

        expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
        expect(screen.getByLabelText("Email:")).toBeInTheDocument();
        expect(screen.getByLabelText("Password:")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    });

    test("handles successful login", async () => {
        (loginUser as jest.Mock).mockResolvedValue("mocked_token");

        render(
            <MemoryRouter>
                <AuthPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText("Email:"), { target: { value: "test@example.com" } });
        fireEvent.change(screen.getByLabelText("Password:"), { target: { value: "password123" } });
        fireEvent.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() => {
            expect(localStorage.setItem).toHaveBeenCalledWith("token", "mocked_token");
        });
    });

    test("handles failed login", async () => {
        (loginUser as jest.Mock).mockRejectedValue(new Error("Invalid credentials"));

        render(
            <MemoryRouter>
                <AuthPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText("Email:"), { target: { value: "wrong@example.com" } });
        fireEvent.change(screen.getByLabelText("Password:"), { target: { value: "wrongpass" } });
        fireEvent.click(screen.getByRole("button", { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByText("Authentication failed. Please check your credentials.")).toBeInTheDocument();
        });
    });

    test("handles successful registration", async () => {
        (registerUser as jest.Mock).mockResolvedValue(undefined);

        render(
            <MemoryRouter>
                <AuthPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole("button", { name: /register/i })); // Switch to register mode

        fireEvent.change(screen.getByLabelText("Email:"), { target: { value: "newuser@example.com" } });
        fireEvent.change(screen.getByLabelText("Password:"), { target: { value: "newpassword" } });
        fireEvent.click(screen.getByRole("button", { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
        });
    });

    test("handles failed registration", async () => {
        (registerUser as jest.Mock).mockRejectedValue(new Error("Registration error"));

        render(
            <MemoryRouter>
                <AuthPage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole("button", { name: /register/i })); // Switch to register mode

        fireEvent.change(screen.getByLabelText("Email:"), { target: { value: "fail@example.com" } });
        fireEvent.change(screen.getByLabelText("Password:"), { target: { value: "failpass" } });
        fireEvent.click(screen.getByRole("button", { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText("Authentication failed. Please check your credentials.")).toBeInTheDocument();
        });
    });
});
