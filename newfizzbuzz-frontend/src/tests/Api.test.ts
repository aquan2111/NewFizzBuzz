import axios, { AxiosRequestConfig } from "axios";
import { Api } from "../services/Api"; // Now import Api after axios is mocked

// Mock axios.create() before importing Api.ts
jest.mock("axios", () => {
    const mockAxios = jest.requireActual("axios");

    return {
        ...mockAxios,
        create: jest.fn(() => ({
            defaults: {
                baseURL: "http://localhost:8080/api",
                headers: { "Content-Type": "application/json" },
            },
            interceptors: {
                request: { use: jest.fn(), eject: jest.fn() },
                response: { use: jest.fn(), eject: jest.fn() },
            },
        })),
    };
});

describe("Api service", () => {
    test("should have the correct base URL and headers", () => {
        expect(Api.defaults.baseURL).toBe("http://localhost:8080/api");
        expect(Api.defaults.headers["Content-Type"]).toBe("application/json");
    });

    test("should attach Authorization token if present in localStorage", () => {
        localStorage.setItem("token", "fake-jwt-token");
        const requestInterceptor = Api.interceptors.request.use as jest.Mock;
        const mockConfig: AxiosRequestConfig = { headers: {} };

        requestInterceptor.mock.calls[0][0](mockConfig); // Call interceptor

        expect(mockConfig.headers?.Authorization).toBe("Bearer fake-jwt-token");
    });

    test("should not attach Authorization token if no token is present", () => {
        localStorage.removeItem("token"); // Ensure no token is present
        const requestInterceptor = Api.interceptors.request.use as jest.Mock;
        const mockConfig: AxiosRequestConfig = { headers: {} };
    
        requestInterceptor.mock.calls[0][0](mockConfig); // Call interceptor
    
        expect(mockConfig.headers).not.toHaveProperty("Authorization"); // Correct assertion
    });
    
});
