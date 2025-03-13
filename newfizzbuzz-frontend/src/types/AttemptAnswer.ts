import { Attempt } from "./Attempt";

export interface AttemptAnswer {
    id: number;
    attemptId: number;
    attempt: Attempt;
    quizQuestionId: number; // The number in the FizzBuzz sequence
    answer: string;
    isCorrect: boolean;
}
