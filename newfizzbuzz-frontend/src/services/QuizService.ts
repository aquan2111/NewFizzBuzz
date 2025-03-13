import { Quiz } from "../types/Quiz";
import { Api } from "./Api";

// Get all quizzes
export const getAllQuizzes = async (): Promise<Quiz[]> => {
    try {
        const response = await Api.get("/quiz");
        return response.data;
    } catch (error) {
        throw new Error("Error fetching quizzes.");
    }
};

// Get quizzes created by the logged-in user
export const getUserQuizzes = async (userId?: number): Promise<Quiz[]> => {
    try {
        const endpoint = userId ? `/quiz/user/${userId}` : `/quiz/user`; // Dynamic URL
        const response = await Api.get(endpoint);
        return response.data;
    } catch (error) {
        console.error("Error fetching user quizzes:", error);
        throw new Error("Error fetching user quizzes.");
    }
};

// Get a quiz by its ID
export const getQuizById = async (quizId: number): Promise<Quiz> => {
    try {
        const response = await Api.get(`/quiz/${quizId}`);
        return response.data;
    } catch (error) {
        throw new Error("Error fetching quiz by ID.");
    }
};

// Create a new quiz
export const createQuiz = async (quizData: any) => {
    try {
        const response = await Api.post("/quiz", quizData);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 400) {
            throw new Error(error.response.data.message); // Show backend message
        }
        throw new Error("Error creating quiz.");
    }
};


// Update an existing quiz
export const updateQuiz = async (quizId: number, quizData: { title: string; rules: { divisor: number; word: string }[] }): Promise<Quiz> => {
    try {
        const response = await Api.put(`/quiz/${quizId}`, quizData);
        return response.data;
    } catch (error) {
        throw new Error("Error updating quiz.");
    }
};

// Delete a quiz
export const deleteQuiz = async (quizId: number): Promise<void> => {
    try {
        await Api.delete(`/quiz/${quizId}`);
    } catch (error) {
        throw new Error("Error deleting quiz.");
    }
};
