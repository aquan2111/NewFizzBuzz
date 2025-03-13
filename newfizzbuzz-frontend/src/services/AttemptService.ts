import { Attempt } from "../types/Attempt";
import { Api } from "./Api";

// Get attempt details by attempt ID
export const getAttemptDetails = async (attemptId: number): Promise<Attempt> => {
    try {
        const response = await Api.get(`/attempt/${attemptId}`);
        return response.data;
    } catch (error) {
        throw new Error("Error fetching attempt details.");
    }
};

// Create a new attempt
export const createAttempt = async (attemptData: Omit<Attempt, "id" | "quiz">): Promise<Attempt> => {
    try {
        const response = await Api.post("/attempt", attemptData);
        return response.data;
    } catch (error) {
        throw new Error("Error creating attempt.");
    }
};

// Get all attempts for a specific quiz
export const getQuizAttempts = async (quizId: number): Promise<Attempt[]> => {
    try {
        const response = await Api.get(`/attempt/quiz/${quizId}`);
        return response.data;
    } catch (error) {
        throw new Error("Error fetching quiz attempts.");
    }
};

// Get all attempts by a user
export const getUserAttempts = async (userId: number): Promise<Attempt[]> => {
    try {
        const response = await Api.get(`/attempt/user/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error("Error fetching user attempts.");
    }
};

export const getUserAttemptsForQuiz = async (userId: number, quizId: number): Promise<Attempt[]> => {
    try {
        const response = await Api.get(`/attempt/user/${userId}/quiz/${quizId}`);
        return response.data;
    } catch (error) {
        throw new Error("Error fetching user attempts.");
    }
};
