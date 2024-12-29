"use client";

import { ResponsiveModal } from "@/components/custom-ui/responsive-modal";

import { CreateWorkspaceForm } from "./create-workspace-form";
import { useCreateWorkspcaeModal } from "../hooks/use-create-workspace-modal";

export const CreateWorkspaceModal = () => {
    const { isOpen, setIsOpen, close } = useCreateWorkspcaeModal();

    return (
        <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
            <CreateWorkspaceForm onCancel={close} />
        </ResponsiveModal>
    );
};