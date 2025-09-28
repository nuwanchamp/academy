import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post('/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            navigate('/home');
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error('Registration error:', error);
            }
        }
    };

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    {errors.name && <span>{errors.name[0]}</span>}
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    {errors.email && <span>{errors.email[0]}</span>}
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    {errors.password && <span>{errors.password[0]}</span>}
                </div>
                <div>
                    <label htmlFor="password_confirmation">Confirm Password</label>
                    <input type="password" id="password_confirmation" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}