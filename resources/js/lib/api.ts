import axios from 'axios';

export interface ParentOption {
    id: number;
    value: string;
    label: string;
    email: string;
}

export async function fetchParents(): Promise<ParentOption[]> {
    const response = await axios.get('/api/v1/parents');
    const items = response.data?.data ?? [];
    return items.map((item: any) => {
        const user = item.user ?? {};
        const label = user.name || `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email;
        return {
            id: Number(user.id),
            value: String(user.id),
            label,
            email: user.email,
        } as ParentOption;
    });
}
