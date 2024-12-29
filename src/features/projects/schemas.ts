import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string().trim().min(1, "Workspace name is required"),
    image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
        z.null(),
    ]).optional(),
    workspaceId: z.string(),
});

export const updateProjectSchema = z.object({
    name: z.string().trim().min(1, "Workspace name is required").optional(),
    image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
        z.null(),
    ]).optional(),
});