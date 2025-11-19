import {BrowserRouter} from "react-router-dom";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import Students from "@/pages/Students.tsx";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Students roster page", () => {
const consoleWarn = console.warn;

beforeEach(() => {
    jest.clearAllMocks();
    console.warn = jest.fn();
});

afterEach(() => {
    console.warn = consoleWarn;
});

    const renderComponent = () =>
        render(
            <BrowserRouter>
                <Students />
            </BrowserRouter>,
        );

    test("fetches and renders students from the API", async () => {
        mockedAxios.get.mockResolvedValue({
            data: {
                data: [
                    {
                        id: 1,
                        first_name: "Ava",
                        last_name: "Rivera",
                        grade: "Grade 2",
                        status: "active",
                        date_of_birth: "2017-08-12",
                    },
                    {
                        id: 2,
                        first_name: "Noah",
                        last_name: "Alvarez",
                        status: "onboarding",
                    },
                ],
                meta: {
                    current_page: 1,
                    last_page: 1,
                    total: 2,
                },
                filters: {
                    grades: ["Grade 2"],
                },
            },
        } as never);

        renderComponent();

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/students?page=1&per_page=3");
        });

        expect(await screen.findByText("Ava Rivera")).toBeInTheDocument();
        expect(screen.getByText("Noah Alvarez")).toBeInTheDocument();
    });

    test("shows an error card and allows retrying when the request fails", async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error("Server unavailable"));
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                data: [],
                meta: {current_page: 1, last_page: 1, total: 0},
                filters: {grades: []},
            },
        } as never);

        renderComponent();

        const alert = await screen.findByRole("alert");
        expect(alert).toHaveTextContent("Unable to load students");

        fireEvent.click(screen.getByRole("button", {name: /Try again/i}));

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
        });
    });
});
