import { render, screen, waitFor } from '@testing-library/react';
import { AppContent } from '../App';
import * as AuthService from '../services/AuthService';
import * as Auth from '../utils/Auth';
import { MemoryRouter } from 'react-router-dom';

// Mocking dependencies
jest.mock('../services/AuthService', () => ({
    getUserProfile: jest.fn(),
}));

jest.mock('../utils/Auth', () => ({
    getUserIdFromToken: jest.fn(),
}));


describe('App', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('shows loading while fetching user profile', () => {
        // Mock getUserIdFromToken to return a value so the app stays in loading state
        (Auth.getUserIdFromToken as jest.Mock).mockReturnValue('user-123');
        // Don't resolve the getUserProfile promise yet to keep it in loading state
        (AuthService.getUserProfile as jest.Mock).mockImplementation(() => new Promise(() => {}));
        
        render(
            <MemoryRouter>
                <AppContent />
            </MemoryRouter>
        );
        
        expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });

    it('loads user profile when userId is available', async () => {
        const mockUserProfile = { id: 1, name: 'John Doe' };
        // Make getUserIdFromToken return a user ID
        (Auth.getUserIdFromToken as jest.Mock).mockReturnValue('user-123');
        // Mock successful profile fetch
        (AuthService.getUserProfile as jest.Mock).mockResolvedValue(mockUserProfile);
    
        render(
            <MemoryRouter>
                <AppContent />
            </MemoryRouter>
        );
    
        // Wait for loading state to transition
        await waitFor(() => expect(screen.queryByText(/Loading.../i)).toBeNull());
    
        // Check if the user profile content is visible
        expect(screen.getByText('Welcome to NewFizzBuzz!')).toBeInTheDocument();
    });
    

    it('handles user profile error gracefully', async () => {
        // Make getUserIdFromToken return a user ID
        (Auth.getUserIdFromToken as jest.Mock).mockReturnValue('user-123');
        // Mock failed profile fetch
        (AuthService.getUserProfile as jest.Mock).mockRejectedValue(new Error('Failed to fetch profile'));
    
        render(
            <MemoryRouter>
                <AppContent />
            </MemoryRouter>
        );
    
        // Wait for the loading state to transition
        await waitFor(() => expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument());
    
        // Wait for the error message to appear
        await waitFor(() => {
            expect(screen.getByText('Failed to load user profile. Please try again later.')).toBeInTheDocument();
        });
    
        expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });    
    
    it('does not fetch profile when no userId is available', async () => {
        // Mock getUserIdFromToken to return null (no logged in user)
        (Auth.getUserIdFromToken as jest.Mock).mockReturnValue(null);
        
        render(
            <MemoryRouter>
                <AppContent />
            </MemoryRouter>
        );
        
        // Wait for any potential async operations
        await waitFor(() => {
            expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
        });
        
        // Verify getUserProfile was never called
        expect(AuthService.getUserProfile).not.toHaveBeenCalled();
        
        // Home page should be visible
        expect(screen.getByText('Welcome to NewFizzBuzz!')).toBeInTheDocument();
    });
});