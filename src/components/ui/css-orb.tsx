"use client";

import { cn } from "@/lib/utils";

export type OrbState = null | "listening" | "talking" | "thinking";

interface CssOrbProps {
  state?: OrbState;
  size?: number;
  className?: string;
}

export function CssOrb({ state = null, size = 180, className }: CssOrbProps) {
  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Outer glow ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-700",
          state === "talking" && "orb-glow-talking",
          state === "listening" && "orb-glow-listening",
          state === "thinking" && "orb-glow-thinking",
          !state && "orb-glow-idle"
        )}
      />

      {/* Inner glow halo */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-500",
          state === "talking" ? "orb-halo-active" : "orb-halo-idle"
        )}
        style={{ inset: -12 }}
      />

      {/* Main orb sphere */}
      <div
        className={cn(
          "relative rounded-full overflow-hidden transition-all duration-500",
          state === "talking" && "orb-sphere-talking",
          state === "listening" && "orb-sphere-listening",
          state === "thinking" && "orb-sphere-thinking",
          !state && "orb-sphere-idle"
        )}
        style={{ width: size * 0.82, height: size * 0.82 }}
      >
        {/* Gradient layers */}
        <div className="absolute inset-0 orb-gradient-base" />
        <div
          className={cn(
            "absolute inset-0 orb-gradient-overlay transition-opacity duration-700",
            state === "talking"
              ? "opacity-100"
              : state === "listening"
                ? "opacity-60"
                : state === "thinking"
                  ? "opacity-40"
                  : "opacity-20"
          )}
        />
        {/* Specular highlight */}
        <div className="absolute top-[12%] left-[20%] w-[35%] h-[25%] rounded-full bg-white/20 blur-[10px]" />
      </div>
    </div>
  );
}
