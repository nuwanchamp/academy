import "./bootstrap";
import React, {useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from "./pages/Home";
import Register from "./pages/Register";
import axios from "axios";
import "@/lib/i18n.ts";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { Dashboard } from "@/pages/Dashboard.tsx";
import { DashboardLayout } from "@/components/ui/layouts/DashboardLayout.tsx";
import Modules from "@/pages/dashboard/Modules.tsx";
import LearningPaths from "@/pages/LearningPaths.tsx";
import PathCreate from "@/pages/PathCreate.tsx";
import PathView from "@/pages/PathView.tsx";
import Students from "@/pages/Students.tsx";
import Reports from "@/pages/Reports.tsx";
import Settings from "@/pages/Settings.tsx";
import StudentCreate from "@/pages/students/Create.tsx";
import Student from "@/pages/students/Student.tsx";
import StudentEdit from "@/pages/students/StudentEdit.tsx";
import ModuleCreate from "@/pages/ModuleCreate.tsx";
import ModuleView from "@/pages/ModuleView.tsx";
import ProgressTrackingReport from "@/pages/reports/ProgressTracking.tsx";
import StudentProgressReport from "@/pages/reports/StudentProgress.tsx";
import LessonView from "@/pages/LessonView.tsx";

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
                    <Route path="/modules/create" element={<ModuleCreate />} />
                    <Route path="/modules/:id" element={<ModuleView />} />
                    <Route path="/paths" element={<LearningPaths />} />
                    <Route path="/paths/create" element={<PathCreate />} />
                    <Route path="/paths/:id" element={<PathView />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/reports/progress-tracking" element={<ProgressTrackingReport />} />
                    <Route path="/reports/progress-tracking/:studentId" element={<StudentProgressReport />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/students/create" element={<StudentCreate/>} />
                    <Route path="/students/:id" element={<Student/>} />
                    <Route path="/students/:id/edit" element={<StudentEdit/>} />
                    <Route path="/lessons/:id" element={<LessonView />} />
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
