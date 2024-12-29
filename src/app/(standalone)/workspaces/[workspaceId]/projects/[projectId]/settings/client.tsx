"use client";

import { PageError } from "@/components/custom-ui/page-error";
import { PageLoader } from "@/components/custom-ui/page-loader";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

export const ProjectIdSettingsClient = () => {
    const projectId = useProjectId();
    const { data: initialValues, isLoading: isLoadingValues } = useGetProject({ projectId });

    if (isLoadingValues) {
        return <PageLoader />;
    }

    if (!initialValues) {
        return <PageError message="Oops! Project not found." />;
    }

    return (
    <div className="w-full lg:max-w-xl">
        <EditProjectForm 
            initialValues={initialValues}
        />
    </div>
    );
};