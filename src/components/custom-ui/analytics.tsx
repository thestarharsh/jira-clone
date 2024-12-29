import { ProjectAnalyticsResponseType } from "@/features/projects/api/use-get-project-analytics";

import { AnalyticsCard } from "./analytics-card";
import { DottedSeparator } from "./dotted-separator";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export const Analytics = ({ data }: ProjectAnalyticsResponseType) => {
  return (
    <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
      <div className="w-full flex flex-row">
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Total Tasks"
            value={data.currentTasksCount}
            variant={data.tasksDifference > 0 ? "up" : "down"}
            increaseValue={data.tasksDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Assigned Tasks"
            value={data.currentAssigneeTasksCount}
            variant={data.assigneeTasksDifference > 0 ? "up" : "down"}
            increaseValue={data.assigneeTasksDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Completed Tasks"
            value={data.currentCompletedTasksCount}
            variant={data.completedTasksDifference > 0 ? "up" : "down"}
            increaseValue={data.completedTasksDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Overdue Tasks"
            value={data.currentOverdueTasksCount}
            variant={data.overdueTasksDifference > 0 ? "up" : "down"}
            increaseValue={data.overdueTasksDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>
        <div className="flex items-center flex-1">
          <AnalyticsCard
            title="Incomplete Tasks"
            value={data.currentIncompleteTasksCount}
            variant={data.incompleteTasksDifference > 0 ? "up" : "down"}
            increaseValue={data.incompleteTasksDifference}
          />
          <DottedSeparator direction="vertical" />
        </div>
      </div>
      <ScrollBar orientation="horizontal"/>
    </ScrollArea>
  );
};
