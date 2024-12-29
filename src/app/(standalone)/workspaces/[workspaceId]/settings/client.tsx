"use client";

import { PageError } from "@/components/custom-ui/page-error";
import { PageLoader } from "@/components/custom-ui/page-loader";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

export const WorkspaceIdSettingsClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: initialValues, isLoading: isLoadingValues } = useGetWorkspace({
    workspaceId,
  });

  if (isLoadingValues) {
    return <PageLoader />;
  }

  if (!initialValues) {
    return <PageError message="Oops! Project not found." />;
  }

  return (
    <div className="w-full lg:max-w-xl">
      <EditWorkspaceForm initialValues={initialValues} />
    </div>
  );
};
