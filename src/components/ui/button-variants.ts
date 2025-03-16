
import { cn } from "@/lib/utils";

type ButtonVariantProps = { 
  variant?: string; 
  size?: string; 
  className?: string;
};

export const buttonVariants = ({ 
  variant = "default", 
  size = "default", 
  className = "" 
}: ButtonVariantProps) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  let variantStyles = "";
  switch(variant) {
    case "default":
      variantStyles = "bg-fashion-text text-primary-foreground hover:bg-fashion-text/90";
      break;
    case "destructive":
      variantStyles = "bg-destructive text-destructive-foreground hover:bg-destructive/90";
      break;
    case "outline":
      variantStyles = "border border-fashion-dark/20 bg-background hover:bg-accent hover:text-accent-foreground";
      break;
    case "secondary":
      variantStyles = "bg-fashion-light text-fashion-text hover:bg-fashion-light/80";
      break;
    case "ghost":
      variantStyles = "hover:bg-accent hover:text-accent-foreground";
      break;
    case "link":
      variantStyles = "text-fashion-accent underline-offset-4 hover:underline";
      break;
    case "subtle":
      variantStyles = "bg-fashion-light/50 text-fashion-text hover:bg-fashion-light";
      break;
    case "accent":
      variantStyles = "bg-fashion-accent text-white hover:bg-fashion-accent/90";
      break;
    case "glass":
      variantStyles = "backdrop-blur-md bg-white/20 border border-white/30 text-fashion-text hover:bg-white/30 shadow-sm";
      break;
    default:
      variantStyles = "bg-fashion-text text-primary-foreground hover:bg-fashion-text/90";
  }
  
  let sizeStyles = "";
  switch(size) {
    case "default":
      sizeStyles = "h-10 px-4 py-2";
      break;
    case "sm":
      sizeStyles = "h-9 rounded-md px-3";
      break;
    case "lg":
      sizeStyles = "h-11 rounded-md px-8";
      break;
    case "xl":
      sizeStyles = "h-12 rounded-md px-10 text-base";
      break;
    case "icon":
      sizeStyles = "h-10 w-10";
      break;
    default:
      sizeStyles = "h-10 px-4 py-2";
  }
  
  return cn(baseStyles, variantStyles, sizeStyles, className);
};
