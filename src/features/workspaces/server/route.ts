import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { ID, Query } from "node-appwrite";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, TASKS_ID, WORKSPACES_ID } from "@/config";
import { generateInviteCode } from "@/lib/utils";

import { getMember } from "@/features/members/utils";
import { MemberRole } from "@/features/members/types";
import { TaskStatus } from "@/features/tasks/types";
import { sessionMiddleWare } from "@/lib/session-middleware";

import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { Workspace } from "../types";

const app = new Hono()
    .get("/", sessionMiddleWare, async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("userId", user.$id)],
        );

        if (members.total === 0) {
            return c.json({ data: { documents: [], total: 0 } });
        }

        const workspaceIds = members.documents.map((member) => member.workspaceId);

        const workspaces = await databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
            [
                Query.orderDesc("$createdAt"),
                Query.contains("$id", workspaceIds)
            ]
        );

        return c.json({ data: workspaces });
    })
    .get("/:workspaceId", sessionMiddleWare, async (c) => {
        const user = c.get("user");
        const databases = c.get("databases");
        const { workspaceId } = c.req.param();

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member) return c.json({ error: "Unauthorized" }, 401);

        const workspace = await databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId,
        );

        return c.json({ data: workspace });
    })
    .get("/:workspaceId/info", sessionMiddleWare, async (c) => {
        const databases = c.get("databases");
        const { workspaceId } = c.req.param();

        const workspace = await databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId,
        );

        return c.json({
            data: {
                $id: workspace.$id,
                name: workspace.name,
                imageUrl: workspace.imageUrl,
            }
        });
    })
    .post("/", zValidator("form", createWorkspaceSchema), sessionMiddleWare, async (c) => {
        const databases = c.get("databases");
        const storage = c.get("storage");
        const user = c.get("user");

        const { name, image } = c.req.valid("form");

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

        const workspace = await databases.createDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            ID.unique(),
            {
                name,
                userId: user.$id,
                imageUrl: uploadedImageUrl,
                inviteCode: generateInviteCode(12),
            }
        );

        await databases.createDocument(
            DATABASE_ID,
            MEMBERS_ID,
            ID.unique(),
            {
                userId: user.$id,
                workspaceId: workspace.$id,
                role: MemberRole.ADMIN,
            },
        );

        return c.json({ data: workspace })
    })
    .patch("/:workspaceId", zValidator("form", updateWorkspaceSchema), sessionMiddleWare, async (c) => {
        const databases = c.get("databases");
        const storage = c.get("storage");
        const user = c.get("user");

        const { workspaceId } = c.req.param();
        const { name, image } = c.req.valid("form");

        const member = await getMember({ databases, workspaceId, userId: user.$id });

        if (!member || member.role !== MemberRole.ADMIN) {
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

        const workspace = await databases.updateDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId,
            {
                name,
                imageUrl: uploadedImageUrl,
            }
        );

        return c.json({ data: workspace });
    })
    .delete("/:workspaceId", sessionMiddleWare, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        const { workspaceId } = c.req.param();

        const member = await getMember({ databases, workspaceId, userId: user.$id });

        if (!member || member.role !== MemberRole.ADMIN) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        await databases.deleteDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        );

        return c.json({ data: { $id: workspaceId } });
    })
    .post("/:workspaceId/reset-invite-code", sessionMiddleWare, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");

        const { workspaceId } = c.req.param();

        const member = await getMember({ databases, workspaceId, userId: user.$id });

        if (!member || member.role !== MemberRole.ADMIN) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const workspace = await databases.updateDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId,
            {
                inviteCode: generateInviteCode(12),
            },
        );

        return c.json({ data: workspace });
    })
    .post("/:workspaceId/join", sessionMiddleWare, zValidator("json", z.object({ code: z.string() })), async (c) => {
        const { workspaceId } = c.req.param();
        const { code } = c.req.valid("json");

        const databases = c.get("databases");
        const user = c.get("user");

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        })

        if (member) {
            return c.json({ error: "Already a member" }, 400);
        }

        const workspace = await databases.getDocument<Workspace>(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId,
        )

        if (workspace.inviteCode !== code) {
            return c.json({ error: "Invalid invite code" }, 400);
        }

        await databases.createDocument(
            DATABASE_ID,
            MEMBERS_ID,
            ID.unique(),
            {
                workspaceId,
                userId: user.$id,
                role: MemberRole.MEMBER,
            },
        );

        return c.json({ data: workspace });
    })
    .get("/:workspaceId/analytics", sessionMiddleWare, async (c) => {
        const databases = c.get("databases");
        const user = c.get("user");
        const { workspaceId } = c.req.param();

        const member = await getMember({
            databases,
            workspaceId,
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
                Query.equal("workspaceId", workspaceId),
                Query.greaterThanEqual("$createdAt", currentMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", currentMonthEnd.toISOString()),
            ]
        );

        const previousMonthTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId", workspaceId),
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
                Query.equal("workspaceId", workspaceId),
                Query.equal("assigneeId", member.$id),
                Query.greaterThanEqual("$createdAt", currentMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", currentMonthEnd.toISOString()),
            ]
        );

        const previousMonthAssigneeTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId", workspaceId),
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
                Query.equal("workspaceId", workspaceId),
                Query.notEqual("status", TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt", currentMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", currentMonthEnd.toISOString()),
            ]
        );

        const previousMonthIncompleteTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId", workspaceId),
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
                Query.equal("workspaceId", workspaceId),
                Query.equal("status", TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt", currentMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", currentMonthEnd.toISOString()),
            ]
        );

        const previousMonthCompletedTasks = await databases.listDocuments(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.equal("workspaceId", workspaceId),
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
                Query.equal("workspaceId", workspaceId),
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
                Query.equal("workspaceId", workspaceId),
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
    });

export default app;
