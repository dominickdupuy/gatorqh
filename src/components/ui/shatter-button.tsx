"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

// The shatter is plain CSS (`shatter-*` rules in styles/index.css). This was the
// only framer-motion user on the site, and that library was roughly a third of
// the home page's JavaScript.

export interface ShatterButtonProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  shardCount?: number;
  shatterColor?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

interface Shard {
  id: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  size: number;
  clipPath: string;
}

export function ShatterButton({
  children,
  className = '',
  containerClassName = '',
  shardCount = 20,
  shatterColor = '#00ffff',
  onClick,
  style,
}: ShatterButtonProps) {
  const [isShattered, setIsShattered] = useState(false);
  const [shards, setShards] = useState<Shard[]>([]);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleClick = useCallback(() => {
    if (isShattered) return;

    const newShards: Shard[] = [];
    for (let index = 0; index < shardCount; index += 1) {
      const angle = (Math.PI * 2 * index) / shardCount + Math.random() * 0.5;
      const velocity = 100 + Math.random() * 200;
      newShards.push({
        id: index,
        rotation: Math.random() * 720 - 360,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity,
        size: 4 + Math.random() * 12,
        clipPath: `polygon(
          ${Math.random() * 50}% 0%,
          100% ${Math.random() * 50}%,
          ${50 + Math.random() * 50}% 100%,
          0% ${50 + Math.random() * 50}%
        )`,
      });
    }

    setShards(newShards);
    setIsShattered(true);
    onClick?.();

    resetTimerRef.current = window.setTimeout(() => {
      setIsShattered(false);
      setShards([]);
      resetTimerRef.current = null;
    }, 1000);
  }, [isShattered, onClick, shardCount]);

  return (
    <div className={`relative ${containerClassName}`.trim()}>
      <button
        className={`shatter-btn relative overflow-hidden rounded-xl px-8 py-4 font-semibold focus:outline-none focus-visible:outline-none ${isShattered ? 'shatter-btn--shattered' : ''} ${className}`.trim()}
        onClick={handleClick}
        style={{
          background: `linear-gradient(135deg, ${shatterColor}22 0%, ${shatterColor}44 100%)`,
          border: `1px solid ${shatterColor}66`,
          color: shatterColor,
          boxShadow: `0 0 20px ${shatterColor}33, inset 0 0 20px ${shatterColor}11`,
          outline: 'none',
          ...style,
        }}
      >
        <div
          className="shatter-btn__glow absolute inset-0"
          style={{
            background: `radial-gradient(circle at center, ${shatterColor}33 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10 w-full">{children}</div>
      </button>

      {shards.map((shard) => (
        <div
          key={shard.id}
          className="shatter-shard pointer-events-none absolute"
          style={{
            left: '50%',
            top: '50%',
            width: shard.size,
            height: shard.size,
            background: shatterColor,
            boxShadow: `0 0 10px ${shatterColor}, 0 0 20px ${shatterColor}`,
            clipPath: shard.clipPath,
            ['--shard-x' as string]: `${shard.velocityX}px`,
            ['--shard-y' as string]: `${shard.velocityY}px`,
            ['--shard-rotate' as string]: `${shard.rotation}deg`,
          }}
        />
      ))}

      {isShattered && (
        <div
          className="shatter-ring pointer-events-none absolute left-1/2 top-1/2 rounded-full"
          style={{
            border: `2px solid ${shatterColor}`,
            boxShadow: `0 0 30px ${shatterColor}`,
          }}
        />
      )}
    </div>
  );
}

export { ShatterButton as Component };
