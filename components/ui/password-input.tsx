"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function PasswordInput({ className, ...props }: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input type={isVisible ? "text" : "password"} className={cn("pr-12", className)} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        tabIndex={-1}
        className="absolute top-0 right-0 h-full w-11 px-3 hover:bg-transparent"
        onClick={() => setIsVisible((v) => !v)}
      >
        {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </Button>
    </div>
  );
}

export { PasswordInput };
