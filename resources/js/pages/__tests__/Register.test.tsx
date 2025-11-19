import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Register from '../Register';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// Mock axios post request
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Register Component', () => {
    test('renders registration form', () => {
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );
        expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument(); // Use full label
        expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument(); // Use full label
        expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    test('submits form with valid data', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: { message: 'Registration successful' } });

        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith('/register', {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                password_confirmation: 'password123',
            });
        });
    });

    test('displays validation errors', async () => {
        const errors = {
            email: ['The email field is required.'],
            password: ['The password field is required.'],
        };
        mockedAxios.post.mockRejectedValueOnce({ response: { status: 422, data: { errors } } });

        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText('The email field is required.')).toBeInTheDocument();
            expect(screen.getByText('The password field is required.')).toBeInTheDocument();
        });
    });
});
