import {z} from "zod";

export const studentSchema = z.object({
    id: z.number(),
    first_name: z.string(),
    last_name: z.string(),
    preferred_name: z.string().nullable().optional(),
    grade: z.string().nullable().optional(),
    status: z.string().nullable().optional(),
    date_of_birth: z.string().nullable().optional(),
});

export const studentListResponseSchema = z.object({
    data: z.array(studentSchema),
    meta: z
        .object({
            current_page: z.number().optional(),
            last_page: z.number().optional(),
            total: z.number().optional(),
        })
        .optional(),
    filters: z
        .object({
            grades: z.array(z.string()).optional(),
        })
        .optional(),
});
