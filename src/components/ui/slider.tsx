"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

// Color variant type for dynamic slider colors
type SliderVariant = "default" | "warning" | "success";

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  variant?: SliderVariant;
}

const variantStyles: Record<SliderVariant, { track: string; range: string; thumb: string }> = {
  default: {
    track: "bg-primary/20",
    range: "bg-primary",
    thumb: "border-primary/50",
  },
  warning: {
    track: "bg-warning/20",
    range: "bg-warning",
    thumb: "border-warning/50",
  },
  success: {
    track: "bg-success/20",
    range: "bg-success",
    thumb: "border-success/50",
  },
};

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, variant = "default", ...props }, ref) => {
  const styles = variantStyles[variant];

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className={cn("relative h-1.5 w-full grow overflow-hidden rounded-full transition-colors", styles.track)}>
        <SliderPrimitive.Range className={cn("absolute h-full transition-colors", styles.range)} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={cn("block h-4 w-4 rounded-full border bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50", styles.thumb)} />
    </SliderPrimitive.Root>
  );
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
export type { SliderVariant }
