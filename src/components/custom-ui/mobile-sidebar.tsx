"use client";

import { useEffect, useState } from "react";
import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

import { Button } from "../ui/button";
import { Sidebar } from "./sidebar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname])

  return (
    <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant={"secondary"} size={"icon"} className="lg:hidden">
          <MenuIcon className="size-4 text-neutral-500" />
        </Button>
      </SheetTrigger>
      <SheetContent side={"left"} className="p-0">
        <VisuallyHidden>
            <SheetTitle>Menu</SheetTitle>
        </VisuallyHidden>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
