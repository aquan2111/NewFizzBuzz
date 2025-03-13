import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AppRoutes from '../routes';
import HomePage from '../pages/HomePage';
import QuizzesPage from '../pages/QuizzesPage';
import CreateQuizPage from '../pages/CreateQuizPage';
import EditQuizPage from '../pages/EditQuizPage';
import PlayQuizPage from '../pages/PlayQuizPage';
import QuizHistoryPage from '../pages/QuizHistoryPage';
import AttemptDetailsPage from '../pages/AttemptDetailsPage';
import ProfilePage from '../pages/ProfilePage';
import AuthPage from '../pages/AuthPage';

// Mock page components
jest.mock('../pages/HomePage', () => () => <div>Home Page</div>);
jest.mock('../pages/QuizzesPage', () => () => <div>Quizzes Page</div>);
jest.mock('../pages/CreateQuizPage', () => () => <div>Create Quiz Page</div>);
jest.mock('../pages/EditQuizPage', () => () => <div>Edit Quiz Page</div>);
jest.mock('../pages/PlayQuizPage', () => () => <div>Play Quiz Page</div>);
jest.mock('../pages/QuizHistoryPage', () => () => <div>Quiz History Page</div>);
jest.mock('../pages/AttemptDetailsPage', () => () => <div>Attempt Details Page</div>);
jest.mock('../pages/ProfilePage', () => () => <div>Profile Page</div>);
jest.mock('../pages/AuthPage', () => () => <div>Auth Page</div>);

describe('AppRoutes Component', () => {
    const renderWithRouter = (initialRoute: string) => {
        return render(
            <MemoryRouter initialEntries={[initialRoute]}>
                <AppRoutes />
            </MemoryRouter>
        );
    };

    it('renders HomePage on root path', () => {
        renderWithRouter('/');
        expect(screen.getByText('Home Page')).toBeInTheDocument();
    });

    it('renders QuizzesPage on /quizzes path', () => {
        renderWithRouter('/quizzes');
        expect(screen.getByText('Quizzes Page')).toBeInTheDocument();
    });

    it('renders CreateQuizPage on /create-quiz path', () => {
        renderWithRouter('/create-quiz');
        expect(screen.getByText('Create Quiz Page')).toBeInTheDocument();
    });

    it('renders EditQuizPage with dynamic route', () => {
        renderWithRouter('/quiz/123/edit');
        expect(screen.getByText('Edit Quiz Page')).toBeInTheDocument();
    });

    it('renders PlayQuizPage with dynamic route', () => {
        renderWithRouter('/quiz/456/play');
        expect(screen.getByText('Play Quiz Page')).toBeInTheDocument();
    });

    it('renders QuizHistoryPage on /quiz/:quizId/history path', () => {
        renderWithRouter('/quiz/789/history');
        expect(screen.getByText('Quiz History Page')).toBeInTheDocument();
    });

    it('renders AttemptDetailsPage with dynamic route', () => {
        renderWithRouter('/attempt/42');
        expect(screen.getByText('Attempt Details Page')).toBeInTheDocument();
    });

    it('renders ProfilePage with dynamic userId route', () => {
        renderWithRouter('/profile/99');
        expect(screen.getByText('Profile Page')).toBeInTheDocument();
    });

    it('renders AuthPage on /auth path', () => {
        renderWithRouter('/auth');
        expect(screen.getByText('Auth Page')).toBeInTheDocument();
    });

    it('renders QuizHistoryPage on /history/:quizId path', () => {
        renderWithRouter('/history/123');
        expect(screen.getByText('Quiz History Page')).toBeInTheDocument();
    });

    it('renders a Not Found message for invalid routes', () => {
        render(
            <MemoryRouter initialEntries={['/non-existent-path']}>
                <Routes>
                    <Route path="*" element={<div>Page Not Found</div>} />
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    });
});
