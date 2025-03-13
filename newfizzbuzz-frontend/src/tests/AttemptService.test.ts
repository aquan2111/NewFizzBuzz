import { 
    getAttemptDetails, 
    createAttempt, 
    getQuizAttempts, 
    getUserAttempts, 
    getUserAttemptsForQuiz 
} from "../services/AttemptService";
import { Api } from "../services/Api";
import { Attempt } from "../types/Attempt";

jest.mock("../services/Api");

describe("AttemptService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockAttempt: Attempt = {
        id: 1,
        userId: 2,
        quizId: 3,
        quiz: { id: 3, title: "Sample Quiz", rules: [], authorId: 1 },
        attemptedAt: "2025-03-12T12:00:00.000Z",
        correctCount: 5,
        totalQuestions: 10,
        timeLimit: 60,
        attemptAnswers: [],
    };

    test("getAttemptDetails should fetch attempt by ID", async () => {
        (Api.get as jest.Mock).mockResolvedValueOnce({ data: mockAttempt });

        const result = await getAttemptDetails(1);

        expect(Api.get).toHaveBeenCalledWith("/attempt/1");
        expect(result).toEqual(mockAttempt);
    });

    test("getAttemptDetails should throw an error when fetching fails", async () => {
        (Api.get as jest.Mock).mockRejectedValueOnce(new Error("Error fetching attempt details."));

        await expect(getAttemptDetails(1)).rejects.toThrow("Error fetching attempt details.");
    });

    test("createAttempt should send a POST request and return the created attempt", async () => {
        const attemptData = {
            userId: 2,
            quizId: 3,
            attemptedAt: "2025-03-12T12:00:00.000Z",
            correctCount: 5,
            totalQuestions: 10,
            timeLimit: 60,
            attemptAnswers: [],
        };

        (Api.post as jest.Mock).mockResolvedValueOnce({ data: mockAttempt });

        const result = await createAttempt(attemptData);

        expect(Api.post).toHaveBeenCalledWith("/attempt", attemptData);
        expect(result).toEqual(mockAttempt);
    });

    test("createAttempt should throw an error when request fails", async () => {
        (Api.post as jest.Mock).mockRejectedValueOnce(new Error("Error creating attempt."));

        await expect(createAttempt(mockAttempt)).rejects.toThrow("Error creating attempt.");
    });

    test("getQuizAttempts should fetch attempts for a quiz", async () => {
        (Api.get as jest.Mock).mockResolvedValueOnce({ data: [mockAttempt] });

        const result = await getQuizAttempts(3);

        expect(Api.get).toHaveBeenCalledWith("/attempt/quiz/3");
        expect(result).toEqual([mockAttempt]);
    });

    test("getUserAttempts should fetch all attempts by a user", async () => {
        (Api.get as jest.Mock).mockResolvedValueOnce({ data: [mockAttempt] });

        const result = await getUserAttempts(2);

        expect(Api.get).toHaveBeenCalledWith("/attempt/user/2");
        expect(result).toEqual([mockAttempt]);
    });

    test("getUserAttemptsForQuiz should fetch attempts for a user on a specific quiz", async () => {
        (Api.get as jest.Mock).mockResolvedValueOnce({ data: [mockAttempt] });

        const result = await getUserAttemptsForQuiz(2, 3);

        expect(Api.get).toHaveBeenCalledWith("/attempt/user/2/quiz/3");
        expect(result).toEqual([mockAttempt]);
    });
});
