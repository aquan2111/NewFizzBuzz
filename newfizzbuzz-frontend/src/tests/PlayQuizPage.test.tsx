import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PlayQuizPage from '../pages/PlayQuizPage';
import { Api } from '../services/Api';

// Mock the router hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ quizId: '123' }),
  useNavigate: () => jest.fn(),
}));

// Mock the API service
jest.mock('../services/Api', () => ({
  Api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('PlayQuizPage', () => {
  const mockQuizData = {
    id: '123',
    title: 'Test Quiz',
    rules: [
      { divisor: 3, word: 'Fizz' },
      { divisor: 5, word: 'Buzz' },
    ],
  };

  const mockAttemptData = {
    id: 456,
    questions: [
      { id: 1, number: 1 },
      { id: 2, number: 2 },
      { id: 3, number: 3 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock API responses
    (Api.get as jest.Mock).mockResolvedValue({ data: mockQuizData });
    (Api.post as jest.Mock).mockResolvedValue({ data: mockAttemptData });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders the quiz title and rules', async () => {
    render(
      <MemoryRouter initialEntries={['/quiz/123']}>
        <PlayQuizPage />
      </MemoryRouter>
    );

    // Wait for the quiz data to load
    await waitFor(() => {
      expect(Api.get).toHaveBeenCalledWith('/quiz/123');
    });

    expect(screen.getByText('Test Quiz')).toBeInTheDocument();
    expect(screen.getByText('3:')).toBeInTheDocument();
    expect(screen.getByText('Fizz')).toBeInTheDocument();
    expect(screen.getByText('5:')).toBeInTheDocument();
    expect(screen.getByText('Buzz')).toBeInTheDocument();
  });

  it('allows user to set time limit and start the quiz', async () => {
    render(
      <MemoryRouter initialEntries={['/quiz/123']}>
        <PlayQuizPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(Api.get).toHaveBeenCalledWith('/quiz/123');
    });

    // Set time limit
    const timeInput = screen.getByRole('spinbutton');
    fireEvent.change(timeInput, { target: { value: '45' } });
    expect(timeInput).toHaveValue(45);

    // Start the quiz
    fireEvent.click(screen.getByText('Start Quiz'));
    expect(screen.getByText('Game starts in: 3')).toBeInTheDocument();

    // Countdown timer
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Game starts in: 2')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Game starts in: 1')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Check that startAttempt was called
    await waitFor(() => {
      expect(Api.post).toHaveBeenCalledWith('/attempt/start', { quizId: '123', timeLimit: 45 });
    });

    // Check that the first question is displayed
    expect(screen.getByText('Question: 1')).toBeInTheDocument();
    expect(screen.getByText('Time Left: 45s')).toBeInTheDocument();
  });

  it('allows user to submit an answer and move to the next question', async () => {
    render(
      <MemoryRouter initialEntries={['/quiz/123']}>
        <PlayQuizPage />
      </MemoryRouter>
    );

    // Wait for quiz to load
    await waitFor(() => {
      expect(Api.get).toHaveBeenCalledWith('/quiz/123');
    });

    // Start quiz and skip countdown
    fireEvent.click(screen.getByText('Start Quiz'));
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(Api.post).toHaveBeenCalledWith('/attempt/start', expect.any(Object));
    });

    // Submit an answer for the first question
    const answerInput = screen.getByRole('textbox');
    fireEvent.change(answerInput, { target: { value: 'Fizz' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(Api.post).toHaveBeenCalledWith('/attempt/submit-answer', {
        attemptId: 456,
        quizId: '123',
        quizQuestionId: 1,
        answer: 'Fizz',
      });
    });

    // Should move to question 2
    expect(screen.getByText('Question: 2')).toBeInTheDocument();
  });

  it('ends the game when time runs out', async () => {
    render(
      <MemoryRouter initialEntries={['/quiz/123']}>
        <PlayQuizPage />
      </MemoryRouter>
    );

    // Start quiz
    await waitFor(() => expect(Api.get).toHaveBeenCalled());
    fireEvent.click(screen.getByText('Start Quiz'));
    
    // Skip countdown
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => expect(Api.post).toHaveBeenCalled());

    // Fast forward to time almost up
    act(() => {
      jest.advanceTimersByTime(29000);
    });
    
    expect(screen.getByText('Time Left: 1s')).toBeInTheDocument();
    
    // Time's up
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('Game Over! Redirecting...')).toBeInTheDocument();
  });

  it('ends the game when all questions are answered', async () => {
    render(
      <MemoryRouter initialEntries={['/quiz/123']}>
        <PlayQuizPage />
      </MemoryRouter>
    );

    // Start quiz
    await waitFor(() => expect(Api.get).toHaveBeenCalled());
    fireEvent.click(screen.getByText('Start Quiz'));
    
    // Skip countdown
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => expect(Api.post).toHaveBeenCalled());

    // Answer all 3 questions
    for (let i = 0; i < 3; i++) {
      fireEvent.change(screen.getByRole('textbox'), { target: { value: `Answer ${i+1}` } });
      fireEvent.click(screen.getByText('Submit'));
      
      await waitFor(() => {
        expect(Api.post).toHaveBeenCalledWith('/attempt/submit-answer', expect.any(Object));
      });
    }
    
    // After the last question, game should be over
    expect(screen.getByText('Game Over! Redirecting...')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    console.error = jest.fn(); // Suppress console.error for this test
    (Api.get as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <MemoryRouter initialEntries={['/quiz/123']}>
        <PlayQuizPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(Api.get).toHaveBeenCalledWith('/quiz/123');
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    // Should still show loading message since quiz data failed to load
    expect(screen.getByText('Loading Quiz...')).toBeInTheDocument();
  });
});