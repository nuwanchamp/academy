import {MemoryRouter, Route, Routes} from "react-router-dom";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import Student from "@/pages/students/Student.tsx";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const renderComponent = () =>
    render(
        <MemoryRouter initialEntries={["/students/42"]}>
            <Routes>
                <Route path="/students/:id" element={<Student />} />
            </Routes>
        </MemoryRouter>,
    );

describe("Student view page", () => {
const consoleWarn = console.warn;

beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn();
});

afterEach(() => {
    console.warn = consoleWarn;
});

    test("shows student summary data", async () => {
        mockedAxios.get.mockResolvedValue({
            data: {
                data: {
                    id: 42,
                    first_name: "Ava",
                    last_name: "Rivera",
                    preferred_name: "Avi",
                    grade: "Grade 2",
                    status: "active",
                    date_of_birth: "2017-08-12",
                    start_date: "2024-01-15",
                    notes: "Thrives during story time.",
                    diagnoses: ["ADHD"],
                    assessment_summary: "Student can read independently",
                    guardians: [],
                },
            },
        } as never);

        renderComponent();

        expect(await screen.findByText(/Ava Rivera/)).toBeInTheDocument();
        expect(screen.getByTestId("student-grade")).toHaveTextContent("Grade 2");
        expect(screen.getAllByText(/Edit profile/i).length).toBeGreaterThan(0);
    });

    test("renders an error state and retry button", async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error("Server unavailable"));
        renderComponent();

        const alert = await screen.findByText(/Unable to load student profile/i);
        expect(alert).toBeInTheDocument();

        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: {
                    id: 42,
                    first_name: "Ava",
                    last_name: "Rivera",
                },
            },
        } as never);

        fireEvent.click(screen.getByRole("button", {name: /Try again/i}));

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
        });
    });
});
