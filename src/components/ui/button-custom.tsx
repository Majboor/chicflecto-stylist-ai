
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-fashion-text text-primary-foreground hover:bg-fashion-text/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-fashion-dark/20 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-fashion-light text-fashion-text hover:bg-fashion-light/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-fashion-accent underline-offset-4 hover:underline",
        subtle: "bg-fashion-light/50 text-fashion-text hover:bg-fashion-light",
        accent: "bg-fashion-accent text-white hover:bg-fashion-accent/90",
        glass: "backdrop-blur-md bg-white/20 border border-white/30 text-fashion-text hover:bg-white/30 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
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
}

const ButtonCustom = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

ButtonCustom.displayName = "ButtonCustom"

export { ButtonCustom, buttonVariants }
