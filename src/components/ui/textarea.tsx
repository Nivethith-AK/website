import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm font-medium text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground/40 focus:border-accent focus:shadow-[0_0_0_1px_rgba(212,175,55,0.25)]",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
