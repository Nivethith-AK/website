import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-[var(--accent-purple)] text-white hover:bg-[color-mix(in srgb, var(--accent-purple), black 20%)] shadow-md shadow-[var(--accent-purple)]/20",
        primary: "bg-[var(--accent-purple)] text-white hover:bg-[color-mix(in srgb, var(--accent-purple), black 20%)] shadow-md shadow-[var(--accent-purple)]/20",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black bg-transparent",
        secondary:
          "bg-[var(--accent)] text-black hover:bg-[color-mix(in srgb, var(--accent), black 15%)] shadow-md shadow-[var(--accent)]/20",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
        premium: "bg-gradient-to-r from-[var(--accent-purple)] to-[color-mix(in srgb, var(--accent-purple), black 20%)] text-white shadow-xl hover:brightness-110",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-3 rounded-md",
        lg: "h-14 px-10 rounded-xl text-base uppercase tracking-widest font-bold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
