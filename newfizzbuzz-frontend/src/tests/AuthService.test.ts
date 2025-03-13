import { registerUser, loginUser, getUserProfile } from "../services/AuthService";
import { Api } from "../services/Api";
import { User } from "../types/User";

jest.mock("../services/Api");

describe("AuthService", () => {
    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test("registerUser should send a POST request and return the registered user", async () => {
        const mockUser: User = { id: 1, email: "test@example.com", password: "password123" };
        (Api.post as jest.Mock).mockResolvedValueOnce({ data: mockUser });

        const result = await registerUser("test@example.com", "password123");

        expect(Api.post).toHaveBeenCalledWith("/auth/register", {
            email: "test@example.com",
            password: "password123",
        });
        expect(result).toEqual(mockUser);
    });

    test("registerUser should throw an error when registration fails", async () => {
        (Api.post as jest.Mock).mockRejectedValueOnce(new Error("Error registering user."));

        await expect(registerUser("test@example.com", "password123")).rejects.toThrow("Error registering user.");
    });

    test("loginUser should send a POST request, store token and userId, and return the token", async () => {
        const mockResponse = { token: "fake-jwt-token", userId: "1" };
        (Api.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

        const result = await loginUser("test@example.com", "password123");

        expect(Api.post).toHaveBeenCalledWith("/auth/login", {
            email: "test@example.com",
            password: "password123",
        });
        expect(localStorage.getItem("token")).toBe("fake-jwt-token");
        expect(localStorage.getItem("userId")).toBe("1");
        expect(result).toBe("fake-jwt-token");
    });

    test("loginUser should throw an error when login fails", async () => {
        (Api.post as jest.Mock).mockRejectedValueOnce(new Error("Error logging in."));

        await expect(loginUser("test@example.com", "password123")).rejects.toThrow("Error logging in.");
    });

    test("getUserProfile should fetch a user profile by userId", async () => {
        const mockUser: User = { id: 1, email: "test@example.com", password: "password123" };
        (Api.get as jest.Mock).mockResolvedValueOnce({ data: mockUser });

        const result = await getUserProfile(1);

        expect(Api.get).toHaveBeenCalledWith("/user/1");
        expect(result).toEqual(mockUser);
    });

    test("getUserProfile should throw an error when fetching fails", async () => {
        (Api.get as jest.Mock).mockRejectedValueOnce(new Error("Error fetching user profile."));

        await expect(getUserProfile(1)).rejects.toThrow("Error fetching user profile.");
    });
});
