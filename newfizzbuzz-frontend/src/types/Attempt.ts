import { Quiz } from "./Quiz";
import { AttemptAnswer } from "./AttemptAnswer";

export interface Attempt {
    id: number;
    userId: number;
    quizId: number;
    quiz: Quiz;
    attemptedAt: string; // DateTime in ISO format
    correctCount: number;
    totalQuestions: number;
    timeLimit: number;
    attemptAnswers: AttemptAnswer[];
}
