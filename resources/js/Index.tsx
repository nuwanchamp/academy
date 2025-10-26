import React, {useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from "./pages/Home";
import Register from "./pages/Register";
import axios from "axios";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { Dashboard } from "@/pages/Dashboard.tsx";
import { DashboardLayout } from "@/components/ui/layouts/DashboardLayout.tsx";
import Modules from "@/pages/dashboard/Modules.tsx";
import LearningPaths from "@/pages/LearningPaths.tsx";
import Students from "@/pages/Students.tsx";
import Reports from "@/pages/Reports.tsx";
import Settings from "@/pages/Settings.tsx";
import {Create as NewStudent} from "@/pages/students/Create.tsx";
import Student from "@/pages/students/Student.tsx";

const Index: React.FC = () => {
    useEffect(() => {
        axios.get('/sanctum/csrf-cookie');
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/modules" element={<Modules />} />
                    <Route path="/paths" element={<LearningPaths />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/students/create" element={<NewStudent/>} />
                    <Route path="/students/:id" element={<Student/>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

const container = document.getElementById('root');

if (container) {
    const root = ReactDOM.createRoot(container as HTMLElement);
    root.render(
        <React.StrictMode>
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
                <Index/>
            </ThemeProvider>
        </React.StrictMode>
    );
}
