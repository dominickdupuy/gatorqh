"use client";

import * as React from "react";

// Each layer is a tile of box-shadow stars scrolled by a CSS transform
// animation (`star-layer-scroll` in styles/index.css), so the compositor moves
// an already-painted layer. The previous motion/react version drove the same
// scroll from JavaScript on every frame, forever.

type StarLayerProps = React.ComponentProps<"div"> & {
  count: number;
  size: number;
  duration: number;
  starColor: string;
};

function generateStars(count: number, starColor: string) {
  const shadows: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = Math.floor(Math.random() * 4000) - 2000;
    const y = Math.floor(Math.random() * 4000) - 2000;
    shadows.push(`${x}px ${y}px ${starColor}`);
  }
  return shadows.join(", ");
}

function StarLayer({ count, size, duration, starColor, className, style, ...props }: StarLayerProps) {
  const boxShadow = React.useMemo(() => generateStars(count, starColor), [count, starColor]);

  return (
    <div
      data-slot="star-layer"
      className={`absolute left-0 top-0 h-[2000px] w-full ${className ?? ""}`}
      style={{ animation: `star-layer-scroll ${duration}s linear infinite`, ...style }}
      {...props}
    >
      <div className="absolute bg-transparent" style={{ width: `${size}px`, height: `${size}px`, boxShadow }} />
      <div
        className="absolute top-[2000px] bg-transparent"
        style={{ width: `${size}px`, height: `${size}px`, boxShadow }}
      />
    </div>
  );
}

type StarsBackgroundProps = React.ComponentProps<"div"> & {
  factor?: number;
  speed?: number;
  starColor?: string;
};

export function StarsBackground({
  children,
  className,
  factor = 0.05,
  speed = 50,
  starColor = "#fff",
  ...props
}: StarsBackgroundProps) {
  const parallaxRef = React.useRef<HTMLDivElement>(null);

  // Parallax eases toward the pointer with a CSS transition rather than a
  // per-frame spring.
  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const node = parallaxRef.current;
      if (!node) return;
      const x = -(event.clientX - window.innerWidth / 2) * factor;
      const y = -(event.clientY - window.innerHeight / 2) * factor;
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    },
    [factor],
  );

  // A caller's className replaces the default position and background
  // outright, so there's no need for a class-merging library here.
  return (
    <div
      data-slot="stars-background"
      className={`size-full overflow-hidden ${className ?? "relative bg-[radial-gradient(ellipse_at_bottom,_#262626_0%,_#000_100%)]"}`}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <div ref={parallaxRef} className="transition-transform duration-700 ease-out">
        <StarLayer count={1000} size={1} duration={speed} starColor={starColor} />
        <StarLayer count={400} size={2} duration={speed * 2} starColor={starColor} />
        <StarLayer count={200} size={3} duration={speed * 3} starColor={starColor} />
      </div>
      {children}
    </div>
  );
}
