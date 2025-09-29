import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

import {ModeToggle} from "@/components/mode-toggle.tsx";
import {H1} from "@/components/ui/typography/h1.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";

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
            <ModeToggle/>
            <H1>Register</H1>
            <form onSubmit={handleSubmit} className={"container"}>
                {generalError && <p style={{ color: 'red' }}>{generalError}</p>}
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input type="text" id="name" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} disabled={loading} />
                    {errors.name && <p className="text-destructive text-sm">{errors.name[0]}</p>}
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input type="email" id="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} disabled={loading} />
                    {errors.email && <p className="text-destructive text-sm">{errors.email[0]}</p>}
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input type="password" id="password" value={password} onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} disabled={loading} />
                    {errors.password && <p className="text-destructive text-sm">{errors.password[0]}</p>}
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                    <Input type="password" id="password_confirmation" value={passwordConfirmation} onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordConfirmation(e.target.value)} disabled={loading} />
                </div>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </Button>
            </form>
        </div>
    );
}

export default Register;

