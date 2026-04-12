import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full bg-transparent border-b border-white/10 py-3 text-sm tracking-widest font-black uppercase text-foreground outline-none transition-all duration-1000 placeholder:text-muted-foreground/30 focus:border-accent disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:border-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
