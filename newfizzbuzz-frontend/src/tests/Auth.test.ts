import { getUserIdFromToken } from "../utils/Auth";
import { jwtDecode } from "jwt-decode";

jest.mock("jwt-decode", () => ({
    jwtDecode: jest.fn(),
}));

describe("getUserIdFromToken", () => {
    const mockJwtDecode = jwtDecode as jest.MockedFunction<typeof jwtDecode>;

    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    it("should return null if no token is present", () => {
        const result = getUserIdFromToken();
        expect(result).toBeNull();
    });

    it("should return userId as a number if token is valid", () => {
        localStorage.setItem("token", "valid.jwt.token");

        mockJwtDecode.mockReturnValue({ UserId: "123" });

        const result = getUserIdFromToken();
        expect(result).toBe(123);
        expect(mockJwtDecode).toHaveBeenCalledWith("valid.jwt.token");
    });

    it("should return null if UserId is missing from the token", () => {
        localStorage.setItem("token", "valid.jwt.token");

        mockJwtDecode.mockReturnValue({});

        const result = getUserIdFromToken();
        expect(result).toBeNull();
    });

    it("should return null if UserId is not a valid number", () => {
        localStorage.setItem("token", "valid.jwt.token");

        mockJwtDecode.mockReturnValue({ UserId: "invalid" });

        const result = getUserIdFromToken();
        expect(result).toBeNull();
    });

    it("should return null if decoding throws an error", () => {
        localStorage.setItem("token", "invalid.jwt.token");

        mockJwtDecode.mockImplementation(() => {
            throw new Error("Invalid token");
        });

        const result = getUserIdFromToken();
        expect(result).toBeNull();
    });
});
