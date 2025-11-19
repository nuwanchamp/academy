import {BrowserRouter} from "react-router-dom";
import {fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import StudentCreate from "@/pages/students/Create.tsx";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const selectFromDropdown = (testId: string, optionLabel: string) => {
    fireEvent.click(screen.getByTestId(testId));
    const listbox = screen.getByRole("listbox");
    fireEvent.click(within(listbox).getByText(optionLabel));
};

describe("StudentCreate", () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
        mockedAxios.get.mockResolvedValue({data: {data: []}});
    });

    const renderComponent = () =>
        render(
            <BrowserRouter>
                <StudentCreate/>
            </BrowserRouter>,
        );

    test("submits the form and shows a success message", async () => {
        localStorage.setItem("rr_user", JSON.stringify({id: 42, role: "teacher"}));
        mockedAxios.post.mockResolvedValueOnce({data: {data: {id: 999}}});

        renderComponent();

        fireEvent.change(screen.getByLabelText(/Student Name/i), {target: {value: "Ava Rivera"}});
        fireEvent.change(screen.getByLabelText(/Grade/i), {target: {value: "Grade 2"}});
        const currentYear = String(new Date().getFullYear());
        selectFromDropdown("dob-year", currentYear);
        selectFromDropdown("dob-month", "01 - Jan");
        selectFromDropdown("dob-day", "12");

        fireEvent.click(screen.getByRole("button", {name: /Save student/i}));

        const expectedDate = `${currentYear}-01-12`;

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith("/api/v1/students", expect.objectContaining({
                first_name: "Ava",
                last_name: "Rivera",
                grade: "Grade 2",
                date_of_birth: expectedDate,
                case_manager_id: 42,
                teacher_id: 42,
            }));
        });

        expect(screen.getByRole("alert")).toHaveTextContent(/Student profile created/i);
    });

test("shows validation errors from the API", async () => {
    localStorage.setItem("rr_user", JSON.stringify({id: 10, role: "teacher"}));
    mockedAxios.post.mockRejectedValueOnce({
        isAxiosError: true,
        response: {
                status: 422,
                data: {
                    errors: {
                        first_name: ["The first name field is required."],
                    },
                },
            },
        });

        renderComponent();

        fireEvent.change(screen.getByLabelText(/Student Name/i), {target: {value: "Ava Rivera"}});
        fireEvent.change(screen.getByLabelText(/Grade/i), {target: {value: "Grade 2"}});
        const currentYear = String(new Date().getFullYear());
        selectFromDropdown("dob-year", currentYear);
        selectFromDropdown("dob-month", "01 - Jan");
        selectFromDropdown("dob-day", "12");

        fireEvent.click(screen.getByRole("button", {name: /Save student/i}));

        await waitFor(() => {
            expect(screen.getByText(/The first name field is required/i)).toBeInTheDocument();
        });
    });

    test("creates a parent from the drawer and makes it selectable", async () => {
        localStorage.setItem("rr_user", JSON.stringify({id: 42, role: "teacher"}));
        mockedAxios.post.mockResolvedValueOnce({
            data: {
                data: {
                    user: {
                        id: 77,
                        name: "Leah Mendoza",
                        email: "leah@example.com",
                    },
                    profile: {},
                    students: [],
                },
            },
        });

        renderComponent();

        fireEvent.click(screen.getByLabelText(/Add parent/i));
        const drawer = screen.getByRole("dialog", {name: /New Parent/i});
        const drawerWithin = within(drawer);
        fireEvent.change(drawerWithin.getByLabelText(/^Parent Name/i), {target: {value: "Leah Mendoza"}});
        fireEvent.change(drawerWithin.getByLabelText(/^Address/i), {target: {value: "123 Rainbow Rd"}}); // optional
        fireEvent.change(drawerWithin.getByLabelText(/^Phone/i), {target: {value: "+15551234567"}});
        fireEvent.change(drawerWithin.getByLabelText(/^Email/i), {target: {value: "leah@example.com"}});

        fireEvent.click(screen.getByRole("button", {name: /Save parent/i}));

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith("/api/v1/parents", expect.objectContaining({
                first_name: "Leah",
                last_name: "Mendoza",
                email: "leah@example.com",
                primary_phone: "+15551234567",
            }));
        });
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);

        const triggerButton = screen.getByTestId("parent-select-trigger");
        await waitFor(() => {
            expect(triggerButton).toHaveTextContent("Leah Mendoza");
        });
    });
});
