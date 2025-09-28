import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';

function Index() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </BrowserRouter>
    );
}

if (document.getElementById('root')) {
    const root = ReactDOM.createRoot(document.getElementById("root"));

    root.render(
        <React.StrictMode>
            <Index />
        </React.StrictMode>
    )
}