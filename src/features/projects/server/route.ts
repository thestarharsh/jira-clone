import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID, TASKS_ID } from "@/config";

import { getMember } from "@/features/members/utils";
import { sessionMiddleWare } from "@/lib/session-middleware";
import { TaskStatus } from "@/features/tasks/types";

import { createProjectSchema, updateProjectSchema } from "../schemas";
import { Project } from "../types";

const app = new Hono()
    .get("/", sessionMiddleWare, zValidator("query", z.object({ workspaceId: z.string() })), async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");

        const { workspaceId } = c.req.valid("query");

        if (!workspaceId) {
            return c.json({ error: "Missing Workspace Info" }, 400);
        }

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const projects = await databases.listDocuments<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            [
                Query.equal("workspaceId", workspaceId),
                Query.orderDesc("$createdAt"),
            ],
        );

        return c.json({ data: projects });
    })
    .get("/:projectId", sessionMiddleWare, async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");
        const { projectId } = c.req.param();

        const project = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId,
        );

        const member = await getMember({
            databases,
            workspaceId: project.workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        return c.json({ data: project });
    })
    .get("/:projectId/analytics", sessionMiddleWare, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");
        const { projectId } = c.req.param();

        const project = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId,
        );

        const member = await getMember({
            databases,
            workspaceId: project.workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const currentDate = new Date();
        const currentMonthStart = startOfMonth(currentDate);
        const currentMonthEnd = endOfMonth(currentDate);
        const previousMonthStart = startOfMonth(subMonths(currentDate, 1));
        const previousMonthEnd = endOfMonth(subMonths(currentDate, 1));

        const currentMonthTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("projectId", projectId),
                Query.greaterThanEqual("$createdAt", currentMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", currentMonthEnd.toISOString()),
            ]
        );

        const previousMonthTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("projectId", projectId),
                Query.greaterThanEqual("$createdAt", previousMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", previousMonthEnd.toISOString()),
            ]
        );

        const currentTasksCount = currentMonthTasks?.total;
        const previousTasksCount = previousMonthTasks?.total;

        const tasksDifference = currentTasksCount - previousTasksCount;

        const currentMonthAssigneeTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("projectId", projectId),
                Query.equal("assigneeId", member.$id),
                Query.greaterThanEqual("$createdAt", currentMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", currentMonthEnd.toISOString()),
            ]
        );

        const previousMonthAssigneeTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("projectId", projectId),
                Query.equal("assigneeId", member.$id),
                Query.greaterThanEqual("$createdAt", previousMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", previousMonthEnd.toISOString()),
            ]
        );

        const currentAssigneeTasksCount = currentMonthAssigneeTasks?.total;
        const previousAssigneeTasksCount = previousMonthAssigneeTasks?.total;

        const assigneeTasksDifference = currentAssigneeTasksCount - previousAssigneeTasksCount;

        const currentMonthIncompleteTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("projectId", projectId),
                Query.notEqual("status", TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt", currentMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", currentMonthEnd.toISOString()),
            ]
        );

        const previousMonthIncompleteTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("projectId", projectId),
                Query.notEqual("status", TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt", previousMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", previousMonthEnd.toISOString()),
            ]
        );

        const currentIncompleteTasksCount = currentMonthIncompleteTasks?.total;
        const previousIncompleteTasksCount = previousMonthIncompleteTasks?.total;

        const incompleteTasksDifference = currentIncompleteTasksCount - previousIncompleteTasksCount;

        const currentMonthCompletedTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("projectId", projectId),
                Query.equal("status", TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt", currentMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", currentMonthEnd.toISOString()),
            ]
        );

        const previousMonthCompletedTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("projectId", projectId),
                Query.equal("status", TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt", previousMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", previousMonthEnd.toISOString()),
            ]
        );

        const currentCompletedTasksCount = currentMonthCompletedTasks?.total;
        const previousCompletedTasksCount = previousMonthCompletedTasks?.total;

        const completedTasksDifference = currentCompletedTasksCount - previousCompletedTasksCount;

        const currentMonthOverdueTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("projectId", projectId),
                Query.notEqual("status", TaskStatus.DONE),
                Query.lessThan("dueDate", currentDate.toISOString()),
                Query.greaterThanEqual("$createdAt", currentMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", currentMonthEnd.toISOString()),
            ]
        );

        const previousMonthOverdueTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("projectId", projectId),
                Query.notEqual("status", TaskStatus.DONE),
                Query.lessThan("dueDate", currentDate.toISOString()),
                Query.greaterThanEqual("$createdAt", previousMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", previousMonthEnd.toISOString()),
            ]
        );

        const currentOverdueTasksCount = currentMonthOverdueTasks?.total;
        const previousOverdueTasksCount = previousMonthOverdueTasks?.total;

        const overdueTasksDifference = currentOverdueTasksCount - previousOverdueTasksCount;

        return c.json({
            data: {
                currentTasksCount,
                previousTasksCount,
                tasksDifference,
                currentAssigneeTasksCount,
                previousAssigneeTasksCount,
                assigneeTasksDifference,
                currentIncompleteTasksCount,
                previousIncompleteTasksCount,
                incompleteTasksDifference,
                currentCompletedTasksCount,
                previousCompletedTasksCount,
                completedTasksDifference,
                currentOverdueTasksCount,
                previousOverdueTasksCount,
                overdueTasksDifference,
            }
        });
    })
    .post("/", sessionMiddleWare, zValidator("form", createProjectSchema), async (c) => {
        const databases = c.get("databases");
        const storage = c.get("storage");
        const user = c.get("user");

        const { name, image, workspaceId } = c.req.valid("form");

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        let uploadedImageUrl: string | undefined;

        if (image instanceof File) {
            const file = await storage.createFile(
                IMAGES_BUCKET_ID,
                ID.unique(),
                image,
            );

            const arrayBuffer = await storage.getFilePreview(
                IMAGES_BUCKET_ID,
                file.$id,
            );

            uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
        }

        const project = await databases.createDocument(
            DATABASE_ID,
            PROJECTS_ID,
            ID.unique(),
            {
                name,
                imageUrl: uploadedImageUrl,
                workspaceId,
            }
        );

        return c.json({ data: project })
    })
    .patch("/:projectId", zValidator("form", updateProjectSchema), sessionMiddleWare, async (c) => {
        const databases = c.get("databases");
        const storage = c.get("storage");
        const user = c.get("user");

        const { projectId } = c.req.param();
        const { name, image } = c.req.valid("form");

        const existingProject = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId,
        );

        const member = await getMember({ databases, workspaceId: existingProject.workspaceId, userId: user.$id });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        let uploadedImageUrl: string | undefined | null;

        if (image instanceof File) {
            const file = await storage.createFile(
                IMAGES_BUCKET_ID,
                ID.unique(),
                image,
            );

            const arrayBuffer = await storage.getFilePreview(
                IMAGES_BUCKET_ID,
                file.$id,
            );

            uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
        } else {
            uploadedImageUrl = image;
        }

        const project = await databases.updateDocument(
            DATABASE_ID,
            PROJECTS_ID,
            projectId,
            {
                name,
                imageUrl: uploadedImageUrl,
            }
        );

        return c.json({ data: project });
    })
    .delete("/:projectId", sessionMiddleWare, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        const { projectId } = c.req.param();

        const existingProject = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId,
        );

        const member = await getMember({ databases, workspaceId: existingProject.workspaceId, userId: user.$id });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        await databases.deleteDocument(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
        );

        return c.json({ data: { $id: existingProject.$id } });
    });

export default app;