import { 
    getAllQuizzes, 
    getUserQuizzes, 
    getQuizById, 
    createQuiz, 
    updateQuiz, 
    deleteQuiz 
} from "../services/QuizService";
import { Api } from "../services/Api";
import { Quiz } from "../types/Quiz";

jest.mock("../services/Api");

describe("QuizService", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockQuiz: Quiz = {
        id: 1,
        title: "Sample Quiz",
        rules: [{ id: 1, divisor: 3, word: "Fizz" }, { id: 2, divisor: 5, word: "Buzz" }],
        authorId: 2,
    };

    test("getAllQuizzes should fetch all quizzes", async () => {
        (Api.get as jest.Mock).mockResolvedValueOnce({ data: [mockQuiz] });

        const result = await getAllQuizzes();

        expect(Api.get).toHaveBeenCalledWith("/quiz");
        expect(result).toEqual([mockQuiz]);
    });

    test("getUserQuizzes should fetch quizzes for a specific user when userId is provided", async () => {
        (Api.get as jest.Mock).mockResolvedValueOnce({ data: [mockQuiz] });

        const result = await getUserQuizzes(2);

        expect(Api.get).toHaveBeenCalledWith("/quiz/user/2");
        expect(result).toEqual([mockQuiz]);
    });

    test("getUserQuizzes should fetch quizzes for the logged-in user when userId is not provided", async () => {
        (Api.get as jest.Mock).mockResolvedValueOnce({ data: [mockQuiz] });

        const result = await getUserQuizzes();

        expect(Api.get).toHaveBeenCalledWith("/quiz/user");
        expect(result).toEqual([mockQuiz]);
    });

    test("getQuizById should fetch a quiz by ID", async () => {
        (Api.get as jest.Mock).mockResolvedValueOnce({ data: mockQuiz });

        const result = await getQuizById(1);

        expect(Api.get).toHaveBeenCalledWith("/quiz/1");
        expect(result).toEqual(mockQuiz);
    });

    test("createQuiz should send a POST request and return the created quiz", async () => {
        (Api.post as jest.Mock).mockResolvedValueOnce({ data: mockQuiz });

        const quizData = { title: "Sample Quiz", rules: [{ divisor: 3, word: "Fizz" }], authorId: 2 };
        const result = await createQuiz(quizData);

        expect(Api.post).toHaveBeenCalledWith("/quiz", quizData);
        expect(result).toEqual(mockQuiz);
    });

    test("createQuiz should throw an error when request fails", async () => {
        (Api.post as jest.Mock).mockRejectedValueOnce({ response: { status: 400, data: { message: "Invalid quiz data." } } });

        await expect(createQuiz(mockQuiz)).rejects.toThrow("Invalid quiz data.");
    });

    test("updateQuiz should send a PUT request and return the updated quiz", async () => {
        (Api.put as jest.Mock).mockResolvedValueOnce({ data: mockQuiz });

        const updatedQuizData = { title: "Updated Quiz", rules: [{ divisor: 7, word: "Boom" }] };
        const result = await updateQuiz(1, updatedQuizData);

        expect(Api.put).toHaveBeenCalledWith("/quiz/1", updatedQuizData);
        expect(result).toEqual(mockQuiz);
    });

    test("deleteQuiz should send a DELETE request", async () => {
        (Api.delete as jest.Mock).mockResolvedValueOnce({});

        await deleteQuiz(1);

        expect(Api.delete).toHaveBeenCalledWith("/quiz/1");
    });

    test("deleteQuiz should throw an error when deletion fails", async () => {
        (Api.delete as jest.Mock).mockRejectedValueOnce(new Error("Error deleting quiz."));

        await expect(deleteQuiz(1)).rejects.toThrow("Error deleting quiz.");
    });
});
