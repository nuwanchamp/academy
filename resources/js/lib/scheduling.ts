import api from './api_client';

export interface StudySessionPayload {
    title: string;
    description?: string | null;
    starts_at: string;
    ends_at: string;
    location?: string | null;
    meeting_url?: string | null;
    capacity: number;
    timezone?: string;
    recurrence?: {
        frequency: 'daily' | 'weekly';
        count: number;
    } | null;
}

export interface StudySessionOccurrenceDTO {
    id: number;
    starts_at: string;
    ends_at: string;
    status: string;
}

export interface StudySessionDTO {
    id: number;
    title: string;
    description: string | null;
    starts_at: string;
    ends_at: string;
    location: string | null;
    meeting_url: string | null;
    capacity: number;
    timezone: string;
    status: string;
    enrolled_count: number;
    waitlist_count: number;
    occurrences?: StudySessionOccurrenceDTO[];
}

export async function listStudySessions(): Promise<StudySessionDTO[]> {
    const response = await api.get('/study-sessions');
    return response.data?.data ?? [];
}

export async function showStudySession(id: number): Promise<StudySessionDTO> {
    const response = await api.get(`/study-sessions/${id}`);
    return response.data?.data;
}

export async function createStudySession(payload: StudySessionPayload): Promise<StudySessionDTO> {
    const response = await api.post('/study-sessions', payload);
    return response.data?.data;
}

export async function updateStudySession(id: number, payload: Partial<StudySessionPayload> & { status?: string; apply_to?: 'series' }): Promise<StudySessionDTO> {
    const response = await api.patch(`/study-sessions/${id}`, payload);
    return response.data?.data;
}

export async function updateOccurrence(sessionId: number, occurrenceId: number, payload: Partial<Pick<StudySessionOccurrenceDTO, 'starts_at' | 'ends_at' | 'status'>>): Promise<StudySessionOccurrenceDTO> {
    const response = await api.patch(`/study-sessions/${sessionId}/occurrences/${occurrenceId}`, payload);
    return response.data?.data;
}

export async function enrollStudent(sessionId: number, studentId: number) {
    const response = await api.post(`/study-sessions/${sessionId}/enrollments`, {
        student_id: studentId,
    });
    return response.data?.data;
}

export async function cancelEnrollment(sessionId: number, enrollmentId: number) {
    await api.delete(`/study-sessions/${sessionId}/enrollments/${enrollmentId}`);
}
