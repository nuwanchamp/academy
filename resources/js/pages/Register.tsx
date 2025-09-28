import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

interface ValidationErrors {
    name?: string[];
    email?: string[];
    password?: string[];
}

interface ErrorResponse {
    message?: string;
    errors?: ValidationErrors;
}

const Register: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [generalError, setGeneralError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setGeneralError('');

        try {
            await axios.post('/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            setName('');
            setEmail('');
            setPassword('');
            setPasswordConfirmation('');
            navigate('/home');
        } catch (error) {
            const err = error as AxiosError<ErrorResponse>;
            if (err.response) {
                if (err.response.status === 422) {
                    setErrors(err.response.data.errors || {});
                } else {
                    setGeneralError(err.response.data.message || 'An unexpected error occurred.');
                }
            } else {
                setGeneralError('Network error or server is unreachable.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={"container p-4"}>
            <h1 className={"text-2xl"}>Register</h1>
            <form onSubmit={handleSubmit} className={"container"}>
                {generalError && <p style={{ color: 'red' }}>{generalError}</p>}
                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} disabled={loading} />
                    {errors.name && <span style={{ color: 'red' }}>{errors.name[0]}</span>}
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} disabled={loading} />
                    {errors.email && <span style={{ color: 'red' }}>{errors.email[0]}</span>}
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" value={password} onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} disabled={loading} />
                    {errors.password && <span style={{ color: 'red' }}>{errors.password[0]}</span>}
                </div>
                <div>
                    <label htmlFor="password_confirmation">Confirm Password</label>
                    <input type="password" id="password_confirmation" value={passwordConfirmation} onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordConfirmation(e.target.value)} disabled={loading} />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
        </div>
    );
}

export default Register;

