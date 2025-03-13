import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProfilePage from '../pages/ProfilePage';
import { getUserProfile } from '../services/AuthService';
import { getUserQuizzes, getQuizById } from '../services/QuizService';
import { getUserAttempts } from '../services/AttemptService';
import { User } from '../types/User';
import { Quiz } from '../types/Quiz';
import { Attempt } from '../types/Attempt';

// Mock the service modules
jest.mock('../services/AuthService');
jest.mock('../services/QuizService');
jest.mock('../services/AttemptService');

const mockedGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;
const mockedGetUserQuizzes = getUserQuizzes as jest.MockedFunction<typeof getUserQuizzes>;
const mockedGetUserAttempts = getUserAttempts as jest.MockedFunction<typeof getUserAttempts>;
const mockedGetQuizById = getQuizById as jest.MockedFunction<typeof getQuizById>;

describe('ProfilePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(
      <MemoryRouter initialEntries={['/profile/1']}>
        <Routes>
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Loading user data...')).toBeInTheDocument();
  });

  test('renders user profile with quizzes and attempts', async () => {
    // Mock data based on your actual types
    const mockUser: User = { 
      id: 1, 
      email: 'test@example.com',
      password: 'hashedpassword'  // Note: this wouldn't normally be returned from an API
    };
    
    const mockQuizzes: Quiz[] = [
      { 
        id: 1, 
        title: 'Quiz 1', 
        rules: [{ id: 1, divisor: 3, word: 'Fizz' }],
        authorId: 1
      },
      { 
        id: 2, 
        title: 'Quiz 2', 
        rules: [{ id: 2, divisor: 5, word: 'Buzz' }],
        authorId: 1
      }
    ];
    
    const mockAttempts: Attempt[] = [
      { 
        id: 1, 
        userId: 1, 
        quizId: 1, 
        quiz: mockQuizzes[0],
        attemptedAt: '2025-03-13T10:00:00Z', 
        correctCount: 8, 
        totalQuestions: 10,
        timeLimit: 300,
        attemptAnswers: []
      },
      { 
        id: 2, 
        userId: 1, 
        quizId: 2, 
        quiz: mockQuizzes[1],
        attemptedAt: '2025-03-13T11:00:00Z', 
        correctCount: 5, 
        totalQuestions: 10,
        timeLimit: 300,
        attemptAnswers: []
      }
    ];

    // Setup mocks
    mockedGetUserProfile.mockResolvedValue(mockUser);
    mockedGetUserQuizzes.mockResolvedValue(mockQuizzes);
    mockedGetUserAttempts.mockResolvedValue(mockAttempts);
    mockedGetQuizById.mockImplementation(async (id) => {
      const quiz = mockQuizzes.find(q => q.id === id);
      return quiz || { 
        id, 
        title: 'Unknown Quiz',
        rules: [],
        authorId: 1
      };
    });

    render(
      <MemoryRouter initialEntries={['/profile/1']}>
        <Routes>
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    // Check that user data is displayed
    expect(screen.getByText(/email:/i)).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();

    // Check that quizzes are displayed
    expect(screen.getByText('Quizzes Created')).toBeInTheDocument();
    expect(screen.getByText('Quiz 1')).toBeInTheDocument();
    expect(screen.getByText('Quiz 2')).toBeInTheDocument();

    // Check that attempts are displayed
    expect(screen.getByText('Quiz Attempts')).toBeInTheDocument();
    expect(screen.getByText(/quiz 1 - score: 8\/10/i)).toBeInTheDocument();
    expect(screen.getByText(/quiz 2 - score: 5\/10/i)).toBeInTheDocument();

    // Verify service calls
    expect(mockedGetUserProfile).toHaveBeenCalledWith(1);
    expect(mockedGetUserQuizzes).toHaveBeenCalledWith(1);
    expect(mockedGetUserAttempts).toHaveBeenCalledWith(1);
    expect(mockedGetQuizById).toHaveBeenCalledTimes(2);
  });

  test('displays message when user has no quizzes', async () => {
    // Mock data with empty quizzes array
    const mockUser: User = { 
      id: 1, 
      email: 'test@example.com',
      password: 'hashedpassword'
    };
    
    const mockQuizzes: Quiz[] = [];
    
    const testQuiz: Quiz = {
      id: 1,
      title: 'Test Quiz',
      rules: [{ id: 1, divisor: 3, word: 'Fizz' }],
      authorId: 2 // Different author
    };
    
    const mockAttempts: Attempt[] = [
      { 
        id: 1, 
        userId: 1, 
        quizId: 1, 
        quiz: testQuiz,
        attemptedAt: '2025-03-13T10:00:00Z', 
        correctCount: 8, 
        totalQuestions: 10,
        timeLimit: 300,
        attemptAnswers: []
      }
    ];

    // Setup mocks
    mockedGetUserProfile.mockResolvedValue(mockUser);
    mockedGetUserQuizzes.mockResolvedValue(mockQuizzes);
    mockedGetUserAttempts.mockResolvedValue(mockAttempts);
    mockedGetQuizById.mockResolvedValue(testQuiz);

    render(
      <MemoryRouter initialEntries={['/profile/1']}>
        <Routes>
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('No quizzes created.')).toBeInTheDocument();
    expect(screen.getByText(/test quiz - score: 8\/10/i)).toBeInTheDocument();
  });

  test('displays message when user has no attempts', async () => {
    // Mock data with empty attempts array
    const mockUser: User = { 
      id: 1, 
      email: 'test@example.com',
      password: 'hashedpassword'
    };
    
    const mockQuizzes: Quiz[] = [
      { 
        id: 1, 
        title: 'Quiz 1', 
        rules: [{ id: 1, divisor: 3, word: 'Fizz' }],
        authorId: 1
      }
    ];
    
    const mockAttempts: Attempt[] = [];

    // Setup mocks
    mockedGetUserProfile.mockResolvedValue(mockUser);
    mockedGetUserQuizzes.mockResolvedValue(mockQuizzes);
    mockedGetUserAttempts.mockResolvedValue(mockAttempts);

    render(
      <MemoryRouter initialEntries={['/profile/1']}>
        <Routes>
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    expect(screen.getByText('Quiz 1')).toBeInTheDocument();
    expect(screen.getByText('No quiz attempts found.')).toBeInTheDocument();
  });

  test('handles error in data fetching', async () => {
    // Setup mock to throw error
    mockedGetUserProfile.mockRejectedValue(new Error('Failed to fetch user'));
    
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={['/profile/1']}>
        <Routes>
          <Route path="/profile/:userId" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    );

    // Should still show loading initially
    expect(screen.getByText('Loading user data...')).toBeInTheDocument();
    
    // Verify error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
});