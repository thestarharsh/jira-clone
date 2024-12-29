import { z } from "zod";
import { Hono } from "hono";
import { Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { sessionMiddleWare } from "@/lib/session-middleware";
import { createAdminClient } from "@/lib/appwrite";
import { DATABASE_ID, MEMBERS_ID } from "@/config";

import { getMember } from "../utils";
import { Member, MemberRole } from "../types";

const app = new Hono()
    .get("/", sessionMiddleWare, zValidator("query", z.object({ workspaceId: z.string() })), async (c) => {
        const { users } = await createAdminClient();
        const databases = c.get("databases");
        const user = c.get("user");
        const { workspaceId } = c.req.valid("query");

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const members = await databases.listDocuments<Member>(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("workspaceId", workspaceId)],
        );

        const populatedMembers = await Promise.all(
            members.documents.map(async (member) => {
                const user = await users.get(member.userId);

                return {
                    ...member,
                    name: user.name || user.email,
                    email: user.email,
                }
            })
        );

        return c.json({
            data: {
                ...members,
                documents: populatedMembers,
            },
        });
    })
    .delete("/:memberId", sessionMiddleWare, async (c) => {
        const { memberId } = c.req.param();
        const user = c.get("user");
        const databases = c.get("databases");

        const memberToDelete = await databases.getDocument(
            DATABASE_ID,
            MEMBERS_ID,
            memberId,
        );

        const allMembersInTheWorkspace = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("workspaceId", memberToDelete.workspaceId)]
        );

        const member = await getMember({
            databases,
            workspaceId: memberToDelete.workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({ error: "Unauthorized"}, 401);
        }

        const isMemberPresent = allMembersInTheWorkspace.documents.some(
            (m) => m.$id === memberId
        );
    
        if (!isMemberPresent) {
            return c.json({ error: "Member not found in workspace" }, 404);
        }

        if (allMembersInTheWorkspace.total === 1) {
            return c.json({ error: "Cannot delete the only member of the workspace" }, 400);
        }

        if (member.$id !== memberToDelete.$id && member.role !== MemberRole.ADMIN) {
            return c.json({ error: "Unauthorized"}, 401);
        }

        await databases.deleteDocument(
            DATABASE_ID,
            MEMBERS_ID,
            memberId,
        );

        return c.json({ data: { $id: memberToDelete.$id } });
    }).
    patch("/:memberId", sessionMiddleWare, zValidator("json", z.object({ role: z.nativeEnum(MemberRole) })), async (c) => {
        const { memberId } = c.req.param();
        const { role } = c.req.valid("json");
        const user = c.get("user");
        const databases = c.get("databases");

        const memberToUpdate = await databases.getDocument(
            DATABASE_ID,
            MEMBERS_ID,
            memberId,
        );

        const allMembersInTheWorkspace = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("workspaceId", memberToUpdate.workspaceId)]
        );

        const member = await getMember({
            databases,
            workspaceId: memberToUpdate.workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({ error: "Unauthorized"}, 401);
        }

        const isMemberPresent = allMembersInTheWorkspace.documents.some(
            (m) => m.$id === memberId
        );
    
        if (!isMemberPresent) {
            return c.json({ error: "Member not found in workspace" }, 404);
        }

        if (allMembersInTheWorkspace.total === 1) {
            return c.json({ error: "Cannot downgrade the only member of the workspace" }, 400);
        }

        if (member.role !== MemberRole.ADMIN) {
            return c.json({ error: "Unauthorized"}, 401);
        }

        await databases.updateDocument(
            DATABASE_ID,
            MEMBERS_ID,
            memberId,
            {
                role,
            },
        );

        return c.json({ data: { $id: memberToUpdate.$id } });
    });

export default app;