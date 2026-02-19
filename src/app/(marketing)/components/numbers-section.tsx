"use client";

import { useState, useEffect, useRef } from "react";
import { BanknoteArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Custom hook for counting up animation
function useCountUp(
  target: number,
  duration: number = 2000,
  isActive: boolean
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(
        startValue + (target - startValue) * easeOutQuart
      );

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, isActive]);

  return count;
}

// Numbers Section Component with Intersection Observer
export function NumbersSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const count400 = useCountUp(400, 2000, isVisible);
  const count9 = useCountUp(9, 2000, isVisible);

  return (
    <div ref={sectionRef} className="text-center mb-12">
      <Badge className="m-4 border-success/30 bg-success/10 text-success/80 flex gap-2 w-fit mx-auto">
      <BanknoteArrowUp className="w-4 h-4" />
       Money-Back Policy
      </Badge>
      <h2 className="text-xl md:text-3xl font-normal text-foreground m-2">
        Trusted by <span className="text-primary font-bold">{count400}+</span>{" "}
        smart businesses in{" "}
        <span className="text-primary font-bold">{count9}</span> countries
      </h2>
      <p className="text-muted-foreground text-base leading-relaxed">
      If you don&apos;t rank for 5+ keywords within 2 months, 100% refund. No questions.
      </p>
    </div>
  );
}
