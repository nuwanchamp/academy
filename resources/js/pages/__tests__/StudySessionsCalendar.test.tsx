import {MemoryRouter, Route, Routes} from "react-router-dom";
import {render, screen, waitFor, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom";
import StudySessionsCalendar from "@/pages/StudySessionsCalendar.tsx";
import * as schedulingApi from "@/lib/scheduling.ts";

jest.mock("@/lib/scheduling.ts");

const mockedApi = schedulingApi as jest.Mocked<typeof schedulingApi>;

describe("Study sessions calendar view", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderCalendar = (path = "/study-sessions/calendar/2025-01-29") =>
        render(
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/study-sessions/calendar/:date" element={<StudySessionsCalendar />} />
                </Routes>
            </MemoryRouter>,
        );

    test("shows day view timeline and details for selected date", async () => {
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

        renderCalendar("/study-sessions/calendar/2025-02-01");

        const matches = await screen.findAllByText("Reading Lab");
        expect(matches.length).toBeGreaterThan(0);
        expect(screen.getByRole("heading", {name: "Calendar"})).toBeInTheDocument();
        expect(mockedApi.listStudySessions).toHaveBeenCalled();
    });

    test("switches to week view", async () => {
        mockedApi.listStudySessions.mockResolvedValue([
            {
                id: 2,
                title: "Math Club",
                description: null,
                starts_at: "2025-01-29 09:00:00",
                ends_at: "2025-01-29 10:00:00",
                location: null,
                meeting_url: null,
                capacity: 6,
                timezone: "UTC",
                status: "scheduled",
                enrolled_count: 3,
                waitlist_count: 0,
                occurrences: [
                    {id: 20, starts_at: "2025-01-29 09:00:00", ends_at: "2025-01-29 10:00:00", status: "scheduled"},
                ],
            },
        ] as any);

        renderCalendar();

        await waitFor(() => expect(mockedApi.listStudySessions).toHaveBeenCalled());
        const weekTab = await screen.findByRole("tab", {name: /Week/i});
        fireEvent.click(weekTab);

        const items = await screen.findAllByText(/Math Club/);
        expect(items.length).toBeGreaterThan(0);
    });
});
