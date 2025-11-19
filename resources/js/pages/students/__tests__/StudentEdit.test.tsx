import {MemoryRouter, Route, Routes} from "react-router-dom";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import StudentEdit from "@/pages/students/StudentEdit.tsx";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const renderComponent = () =>
    render(
        <MemoryRouter initialEntries={["/students/42/edit"]}>
            <Routes>
                <Route path="/students/:id/edit" element={<StudentEdit />} />
            </Routes>
        </MemoryRouter>,
    );

describe("StudentEdit page", () => {
const consoleWarn = console.warn;

beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn();
});

afterEach(() => {
    console.warn = consoleWarn;
});

    test("fetches and displays the student profile", async () => {
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
                    start_date: "2024-01-10",
                    notes: "Excels in sensory play.",
                    diagnoses: ["ADHD"],
                    assessment_summary: "Student can read independently",
                    guardians: [
                        {
                            id: 7,
                            name: "Morgan Rivera",
                            email: "morgan@example.com",
                            pivot: {
                                relationship: "Mother",
                                is_primary: true,
                                access_level: "view",
                                notifications_opt_in: true,
                            },
                            profile: {
                                primary_phone: "+15551234567",
                                address_line1: "123 Rainbow Rd",
                            },
                        },
                    ],
                },
            },
        } as never);

        renderComponent();

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/students/42");
        });

        expect(await screen.findByText(/Ava Rivera/)).toBeInTheDocument();
        expect(screen.getByTestId("student-status-badge")).toHaveTextContent("Active");
        expect(screen.getByText(/Excels in sensory play/)).toBeInTheDocument();
        expect(screen.getByDisplayValue("Morgan Rivera")).toBeInTheDocument();
    });

    test("surfaces an error and retries fetching", async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error("Server unavailable"));
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: {
                    id: 42,
                    first_name: "Ava",
                    last_name: "Rivera",
                },
            },
        } as never);

        renderComponent();

        const errorTitle = await screen.findByText(/Unable to load student profile/i);
        expect(errorTitle).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", {name: /Try again/i}));

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
        });
    });

    test("allows editing and saving profile details", async () => {
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
                    diagnoses: ["ADHD"],
                    assessment_summary: "Student can read independently",
                    guardians: [
                        {
                            id: 7,
                            name: "Morgan Rivera",
                            email: "morgan@example.com",
                            pivot: {
                                relationship: "Mother",
                                is_primary: true,
                                access_level: "view",
                                notifications_opt_in: true,
                            },
                            profile: {
                                primary_phone: "+15551234567",
                                address_line1: "123 Rainbow Rd",
                            },
                        },
                    ],
                },
            },
        } as never);

        mockedAxios.patch.mockResolvedValueOnce({
            data: {
                data: {
                    id: 42,
                    first_name: "Ava Kate",
                    last_name: "Rivera",
                    preferred_name: "Avi",
                    grade: "Grade 3",
                    status: "active",
                    date_of_birth: "2017-08-12",
                },
            },
        } as never);

        renderComponent();

        await screen.findByText(/Ava Rivera/);

        fireEvent.change(screen.getByLabelText(/Student Name/i), {target: {value: "Ava Kate"}});
        fireEvent.change(screen.getByLabelText(/Grade/i), {target: {value: "Grade 3"}});
        fireEvent.change(screen.getByLabelText(/Parent Name/i), {target: {value: "Morgan R."}});
        fireEvent.change(screen.getByLabelText(/Phone/i), {target: {value: "+15550001111"}});
        fireEvent.change(screen.getByLabelText(/Email/i), {target: {value: "morganr@example.com"}});
        fireEvent.change(screen.getByLabelText(/Relationship/i), {target: {value: "Guardian"}});

        fireEvent.click(screen.getByRole("button", {name: /Save changes/i}));

        await waitFor(() => {
            expect(mockedAxios.patch).toHaveBeenCalledWith(
                "/api/v1/students/42",
                expect.objectContaining({
                    first_name: "Ava Kate",
                    grade: "Grade 3",
                    assessment_summary: "Student can read independently",
                    diagnoses: ["ADHD"],
                    guardians: [
                        expect.objectContaining({
                            id: 7,
                            relationship: "Guardian",
                            primary_phone: "+15550001111",
                            email: "morganr@example.com",
                            name: "Morgan R.",
                        }),
                    ],
                }),
            );
        });

        expect(await screen.findByText(/Student profile updated/i)).toBeInTheDocument();
    });
});
