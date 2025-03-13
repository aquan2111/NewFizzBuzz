import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AttemptDetailsPage from '../pages/AttemptDetailsPage';
import { getAttemptDetails } from '../services/AttemptService';
import { Attempt } from '../types/Attempt';
import { Quiz } from '../types/Quiz';
import { AttemptAnswer } from '../types/AttemptAnswer';
import * as RouterModule from 'react-router-dom';

// Mock the dependencies
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
}));

jest.mock('../services/AttemptService', () => ({
  getAttemptDetails: jest.fn(),
}));

// Create a typed version of the mock
const mockedUseParams = RouterModule.useParams as jest.Mock;

// Mock quiz data
const mockQuiz: Quiz = {
  id: 101,
  title: 'JavaScript Basics',
  authorId: 201,
  rules: []
};

// Mock attempt data
const mockAttempt: Attempt = {
  id: 1,
  quizId: 101,
  userId: 1,
  attemptedAt: '2025-03-10T15:30:00Z',
  correctCount: 2,
  totalQuestions: 3,
  timeLimit: 30,
  quiz: mockQuiz,
  attemptAnswers: [
    {
      id: 1001,
      attemptId: 1,
      quizQuestionId: 1,
      answer: 'const',
      isCorrect: true,
      attempt: {} as Attempt
    },
    {
      id: 1002,
      attemptId: 1,
      quizQuestionId: 2,
      answer: 'map',
      isCorrect: true,
      attempt: {} as Attempt
    },
    {
      id: 1003,
      attemptId: 1,
      quizQuestionId: 3,
      answer: 'var',
      isCorrect: false,
      attempt: {} as Attempt
    }
  ]
};

// Fix circular reference
mockAttempt.attemptAnswers.forEach(answer => {
  answer.attempt = mockAttempt;
});

describe('AttemptDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseParams.mockReturnValue({ attemptId: '1' });
  });

  test('should show loading state initially', () => {
    (getAttemptDetails as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<AttemptDetailsPage />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should render attempt details when data is loaded successfully', async () => {
    (getAttemptDetails as jest.Mock).mockResolvedValue(mockAttempt);
    
    render(<AttemptDetailsPage />);
    
    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    
    // Check if all the attempt details are rendered
    expect(screen.getByText('Attempt Details')).toBeInTheDocument();
    
    // Check for quiz title and quiz value separately
    expect(screen.getByText(/Quiz:/)).toBeInTheDocument();
    expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
    
    // Check score elements
    expect(screen.getByText(/Score:/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Check if the answers table is rendered
    expect(screen.getByText('Answers')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4); // Header + 3 answers
    
    // Check some specific answer content
    expect(screen.getByText('const')).toBeInTheDocument();
    expect(screen.getByText('map')).toBeInTheDocument();
    expect(screen.getByText('var')).toBeInTheDocument();
    
    // Check if correct/wrong indicators are present
    expect(screen.getAllByText('✔')).toHaveLength(2);
    expect(screen.getAllByText('✘')).toHaveLength(1);
  });

  test('should handle error when fetching attempt details fails', async () => {
    (getAttemptDetails as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<AttemptDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error fetching attempt details.')).toBeInTheDocument();
    });
  });

  test('should handle invalid attempt ID', async () => {
    mockedUseParams.mockReturnValue({ attemptId: undefined });
    
    render(<AttemptDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid attempt ID.')).toBeInTheDocument();
    });
  });

  test('should handle empty attempt data', async () => {
    (getAttemptDetails as jest.Mock).mockResolvedValue(null);
    
    render(<AttemptDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No attempt details found.')).toBeInTheDocument();
    });
  });

  test('should handle attempt with no answers', async () => {
    const emptyAnswersAttempt: Attempt = {
      ...mockAttempt,
      attemptAnswers: []
    };
    
    (getAttemptDetails as jest.Mock).mockResolvedValue(emptyAnswersAttempt);
    
    render(<AttemptDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No answers provided for this attempt.')).toBeInTheDocument();
    });
  });

  test('should filter out questions without answers', async () => {
    const partialAnswersAttempt: Attempt = {
      ...mockAttempt,
      attemptAnswers: [
        ...mockAttempt.attemptAnswers,
        {
          id: 1004,
          attemptId: 1,
          quizQuestionId: 4,
          answer: '', // Empty answer
          isCorrect: false,
          attempt: mockAttempt
        }
      ]
    };
    
    (getAttemptDetails as jest.Mock).mockResolvedValue(partialAnswersAttempt);
    
    render(<AttemptDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(4); // Header + 3 answers, not 4
    });
  });
});