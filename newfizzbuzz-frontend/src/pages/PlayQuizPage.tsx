import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Api } from "../services/Api"; // Using the configured API instance
import { QuizQuestion } from "../types/QuizQuestion"; // Import QuizQuestion type

const PlayQuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>(); // Get quizId from URL
  const navigate = useNavigate();

  // Game states with type annotations
  const [quiz, setQuiz] = useState<any>(null);
  const [timeLimit, setTimeLimit] = useState(30); // Default 30s, user can change
  const [countdown, setCountdown] = useState(3);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]); // Array of QuizQuestion objects
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [gameOver, setGameOver] = useState(false);

  // Fetch quiz details
  useEffect(() => {
    if (!quizId) return;

    async function fetchQuizData() {
      try {
        const response = await Api.get(`/quiz/${quizId}`); // Correct endpoint
        if (!response.data) {
          console.error("Invalid quiz response.");
          return;
        }
        setQuiz(response.data);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    }
    fetchQuizData();
  }, [quizId]);

  // Handle game countdown before starting
  useEffect(() => {
    if (isPlaying && countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (isPlaying && countdown === 0) {
      startAttempt();
    }
  }, [isPlaying, countdown]);

  // Start the attempt
  const startAttempt = async () => {
    try {
      const res = await Api.post("/attempt/start", { quizId, timeLimit });

      if (!res.data || !res.data.questions) {
        console.error("No questions received from backend.");
        return;
      }

      console.log("Attempt Response:", res.data);

      setAttemptId(res.data.id);
      setQuestions(res.data.questions); // Store questions with {id, number}
      setTimeRemaining(timeLimit);
      setGameOver(false);
      setCurrentIndex(0);

      // Start the countdown timer for the quiz
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Failed to start attempt:", error);
    }
  };

  // Submit answer and move to next question
  const submitAnswer = async () => {
    if (!attemptId || questions.length === 0) return;

    try {
      await Api.post("/attempt/submit-answer", {
        attemptId: attemptId,
        quizId: quizId,
        quizQuestionId: questions[currentIndex].id, // Use id for QuizQuestionId
        answer: userAnswer,
      });

      setUserAnswer("");
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setGameOver(true);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  // Redirect to history after the game ends
  useEffect(() => {
    if (gameOver) {
      setTimeout(() => navigate(`/quiz/${quizId}/history`), 2000);
    }
  }, [gameOver, navigate, quizId]);

  return (
    <div className="play-quiz-container">
      <h1>{quiz ? quiz.title : "Loading Quiz..."}</h1>
      <h3>Quiz Rules:</h3>
      <p>
        {quiz?.rules?.length > 0 ? (
          quiz.rules.map((rule: { divisor: number; word: string }, index: number) => (
            <span key={index}>
              <strong>{rule.divisor}</strong>: {rule.word}
              {index < quiz.rules.length - 1 && ", "}
            </span>
          ))
        ) : (
          "Loading rules..."
        )}
      </p>

      {!isPlaying ? (
        <div>
          <h3>Set your time limit:</h3>
          <input
            type="number"
            min={10}
            max={60}
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
          />
          <button onClick={() => setIsPlaying(true)}>Start Quiz</button>
        </div>
      ) : countdown > 0 ? (
        <h2>Game starts in: {countdown}</h2>
      ) : gameOver ? (
        <h2>Game Over! Redirecting...</h2>
      ) : (
        <div>
          <h3>Time Left: {timeRemaining}s</h3>
          {questions.length > 0 ? (
            <h2>Question: {questions[currentIndex].number}</h2> // Use 'number' property
          ) : (
            <h2>Loading questions...</h2> // Display loading message if questions are empty
          )}
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
          />
          <button onClick={submitAnswer}>Submit</button>
        </div>
      )}
    </div>
  );
};

export default PlayQuizPage;
