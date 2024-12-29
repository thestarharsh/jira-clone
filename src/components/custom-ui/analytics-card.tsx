import { FaCaretDown, FaCaretUp } from "react-icons/fa";

import { cn } from "@/lib/utils";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface AnalyticsCardProps {
    title: string;
    value: number;
    variant: "up" | "down";
    increaseValue: number;
}

export const AnalyticsCard = ({ 
    title,
    value,
    variant,
    increaseValue,
}: AnalyticsCardProps) => {
    const isNeutral = increaseValue === 0;
    const iconColor = variant === "up" && !isNeutral ? "text-emerald-500" : variant === "down" && !isNeutral ? "text-red-500" : "text-gray-500";
    const increaseValueColor = isNeutral ? "text-gray-500" : variant === "up" ? "text-emerald-500" : "text-red-500";
    const Icon = isNeutral ? null : variant === "up" ? FaCaretUp : FaCaretDown;

    return (
        <Card className="border-none shadow-none w-full">
            <CardHeader>
                <div className="flex items-center gap-x-2.5">
                    <CardDescription className="flex items-center gap-x-2 font-medium overflow-hidden">
                        <span className="truncate text-base">
                            {title}
                        </span>
                    </CardDescription>
                    <div className="flex items-center gap-x-1">
                        {Icon && <Icon className={cn(iconColor, "size-4")} />}
                        <span className={cn(increaseValueColor, "truncate text-base font-medium")}>
                            {increaseValue}
                        </span>
                    </div>
                </div>
                <CardTitle className="3xl font-semibold">{value}</CardTitle>
            </CardHeader>
        </Card>
    );
};
