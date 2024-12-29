import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TargetIcon,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";

interface CustomToolbarProps {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}

export const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => {
  return (
    <div className="flex mb-4 items-center w-full justify-between">
      <div className="flex items-center gap-x-2">
        <Button
          onClick={() => onNavigate("PREV")}
          variant={"secondary"}
          size={"icon"}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center">
          <CalendarIcon className="size-4 mr-2" />
          <p className="text">{format(date, "MMMM yyyy")}</p>
        </div>
        <Button
          onClick={() => onNavigate("NEXT")}
          variant={"secondary"}
          size={"icon"}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
      <div>
        <Button
          onClick={() => onNavigate("TODAY")}
          variant={"secondary"}
          size={"sm"}
          className="flex items-center gap-x-2"
        >
          <TargetIcon className="size-4" />
          Today
        </Button>
      </div>
    </div>
  );
};
