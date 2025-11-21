import {BrowserRouter, MemoryRouter} from "react-router-dom";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import StudySessions from "@/pages/StudySessions.tsx";
import * as schedulingApi from "@/lib/scheduling.ts";

jest.mock("@/lib/scheduling.ts");

const mockedApi = schedulingApi as jest.Mocked<typeof schedulingApi>;

describe("Study sessions page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = () =>
        render(
            <BrowserRouter>
                <StudySessions />
            </BrowserRouter>,
        );

    test("renders sessions from the API", async () => {
        mockedApi.listStudySessions.mockResolvedValue([
            {
                id: 1,
                title: "Reading Lab",
                description: "Fluency and comprehension",
                starts_at: "2025-02-01 15:00:00",
                ends_at: "2025-02-01 16:00:00",
                location: "Room 12",
                meeting_url: null,
                capacity: 4,
                timezone: "UTC",
                status: "scheduled",
                enrolled_count: 2,
                waitlist_count: 1,
                occurrences: [
                    {id: 10, starts_at: "2025-02-01 15:00:00", ends_at: "2025-02-01 16:00:00", status: "scheduled"},
                ],
            },
        ] as any);

        renderComponent();

        const titles = await screen.findAllByText("Reading Lab");
        expect(titles.length).toBeGreaterThan(0);
        expect(screen.getByText(/2\/4/)).toBeInTheDocument();
        expect(mockedApi.listStudySessions).toHaveBeenCalled();
    });

    test("submits the quick create form", async () => {
        mockedApi.listStudySessions.mockResolvedValue([]);
        mockedApi.createStudySession.mockResolvedValue({
            id: 2,
        } as any);

        renderComponent();

        await waitFor(() => expect(mockedApi.listStudySessions).toHaveBeenCalledTimes(1));

        fireEvent.change(screen.getByLabelText(/Title/i), {target: {value: "Math Support"}});
        fireEvent.change(screen.getByLabelText(/Starts at/i), {target: {value: "2025-02-02T09:00"}});
        fireEvent.change(screen.getByLabelText(/Ends at/i), {target: {value: "2025-02-02T10:00"}});

        fireEvent.click(screen.getByRole("button", {name: /Create session/i}));

        await waitFor(() => {
            expect(mockedApi.createStudySession).toHaveBeenCalledWith(expect.objectContaining({
                title: "Math Support",
                starts_at: "2025-02-02 09:00:00",
                ends_at: "2025-02-02 10:00:00",
            }));
        });
    });

    test("allows editing a session from the day plan", async () => {
        mockedApi.listStudySessions.mockResolvedValue([
            {
                id: 1,
                title: "Reading Lab",
                description: "Fluency and comprehension",
                starts_at: "2025-02-01 15:00:00",
                ends_at: "2025-02-01 16:00:00",
                location: "Room 12",
                meeting_url: null,
                capacity: 4,
                timezone: "UTC",
                status: "scheduled",
                enrolled_count: 2,
                waitlist_count: 1,
                occurrences: [
                    {id: 10, starts_at: "2025-02-01 15:00:00", ends_at: "2025-02-01 16:00:00", status: "scheduled"},
                ],
            },
        ] as any);
        mockedApi.updateStudySession.mockResolvedValue({} as any);

        render(
            <MemoryRouter initialEntries={["/study-sessions?date=2025-02-01"]}>
                <StudySessions />
            </MemoryRouter>,
        );

        await screen.findAllByText("Reading Lab");

        fireEvent.click(screen.getAllByRole("button", {name: /Edit/i})[0]);

        const titleInput = screen.getByLabelText(/Title/i);
        expect((titleInput as HTMLInputElement).value).toBe("Reading Lab");

        fireEvent.change(titleInput, {target: {value: "Reading Lab Updated"}});
        fireEvent.click(screen.getByRole("button", {name: /Update session/i}));

        await waitFor(() => {
            expect(mockedApi.updateStudySession).toHaveBeenCalledWith(1, expect.objectContaining({
                title: "Reading Lab Updated",
                starts_at: "2025-02-01 15:00:00",
                ends_at: "2025-02-01 16:00:00",
            }));
        });
    });

    test("prefills edit form from query params", async () => {
        mockedApi.listStudySessions.mockResolvedValue([
            {
                id: 3,
                title: "History Club",
                description: "Weekly session",
                starts_at: "2025-02-04 10:00:00",
                ends_at: "2025-02-04 11:00:00",
                location: "Room 2",
                meeting_url: null,
                capacity: 6,
                timezone: "UTC",
                status: "scheduled",
                enrolled_count: 3,
                waitlist_count: 0,
                occurrences: [],
            },
        ] as any);
        mockedApi.updateStudySession.mockResolvedValue({} as any);

        render(
            <MemoryRouter initialEntries={["/study-sessions?edit=3&starts_at=2025-02-04 10:00:00&ends_at=2025-02-04 11:00:00"]}>
                <StudySessions />
            </MemoryRouter>,
        );

        await waitFor(() => expect(screen.getByLabelText(/Title/i)).toHaveValue("History Club"));
        expect(screen.getByRole("button", {name: /Update session/i})).toBeInTheDocument();
    });
});
