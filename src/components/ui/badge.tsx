import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em]",
  {
    variants: {
      variant: {
        default: "border-white/15 bg-white/[0.05] text-white/70",
        accent: "border-accent/35 bg-accent/10 text-accent",
        purple: "border-accent-purple/40 bg-accent-purple/15 text-[#d8b3ff]",
        success: "border-emerald-300/35 bg-emerald-400/10 text-emerald-200",
        warning: "border-amber-300/35 bg-amber-400/10 text-amber-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
