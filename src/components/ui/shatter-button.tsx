"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

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
  x: number;
  y: number;
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
        x: 0,
        y: 0,
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
      <motion.button
        className={`relative overflow-hidden rounded-xl px-8 py-4 font-semibold focus:outline-none focus-visible:outline-none ${className}`.trim()}
        onClick={handleClick}
        animate={{
          scale: isShattered ? 0 : 1,
          opacity: isShattered ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: `linear-gradient(135deg, ${shatterColor}22 0%, ${shatterColor}44 100%)`,
          border: `1px solid ${shatterColor}66`,
          color: shatterColor,
          boxShadow: `0 0 20px ${shatterColor}33, inset 0 0 20px ${shatterColor}11`,
          outline: 'none',
          ...style,
        }}
      >
        <motion.div
          className="absolute inset-0 opacity-0"
          whileHover={{ opacity: 1 }}
          style={{
            background: `radial-gradient(circle at center, ${shatterColor}33 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10 w-full">{children}</div>
      </motion.button>

      <AnimatePresence>
        {shards.map((shard) => (
          <motion.div
            key={shard.id}
            className="pointer-events-none absolute"
            initial={{
              x: shard.x,
              y: shard.y,
              rotate: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: shard.velocityX,
              y: shard.velocityY,
              rotate: shard.rotation,
              opacity: 0,
              scale: 0.5,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              left: '50%',
              top: '50%',
              width: shard.size,
              height: shard.size,
              background: shatterColor,
              boxShadow: `0 0 10px ${shatterColor}, 0 0 20px ${shatterColor}`,
              clipPath: shard.clipPath,
            }}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {isShattered && (
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 300, height: 300, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              border: `2px solid ${shatterColor}`,
              boxShadow: `0 0 30px ${shatterColor}`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export { ShatterButton as Component };
