import React, {useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import axios from 'axios';
import {ThemeProvider} from "@/components/theme-provider.tsx";

const Index: React.FC = () => {
    useEffect(() => {
        axios.get('/sanctum/csrf-cookie');
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/home" element={<Home/>}/>
            </Routes>
        </BrowserRouter>
    );
}

const container = document.getElementById('root');

if (container) {
    const root = ReactDOM.createRoot(container as HTMLElement);

    root.render(
        <React.StrictMode>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <Index/>
            </ThemeProvider>
        </React.StrictMode>
    );
}
