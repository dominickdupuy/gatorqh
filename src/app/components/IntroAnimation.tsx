'use client';

import { type CSSProperties, useEffect, useState } from 'react';
import pixelFires from './pixelFires.png';
import rocket from './rocket.png';

const INTRO_DURATION_MS = 2900;

export function IntroAnimation({ onVisibilityChange }: { onVisibilityChange?: (isVisible: boolean) => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isRocketReady, setIsRocketReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setIsVisible(false);
      onVisibilityChange?.(false);
    }
  }, [onVisibilityChange]);

  useEffect(() => {
    if (!isVisible || !isRocketReady || hasStarted) {
      return;
    }

    const startFrame = window.requestAnimationFrame(() => {
      setHasStarted(true);
      onVisibilityChange?.(true);
    });

    return () => {
      window.cancelAnimationFrame(startFrame);
    };
  }, [hasStarted, isRocketReady, isVisible, onVisibilityChange]);

  useEffect(() => {
    if (!isVisible || !hasStarted) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsVisible(false);
      onVisibilityChange?.(false);
    }, INTRO_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hasStarted, isVisible, onVisibilityChange]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`intro-animation ${hasStarted ? 'intro-animation--playing' : ''}`}
      style={{ '--intro-duration': `${INTRO_DURATION_MS}ms` } as CSSProperties}
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.currentTarget !== event.target) {
          return;
        }

        setIsVisible(false);
        onVisibilityChange?.(false);
      }}
    >
      <div className="rocket-flight-wrapper">
        <div className="rocket-visual">
          <div
            className="rocket-flame-sprite"
            style={{ '--rocket-flame-sprite': `url(${pixelFires})` } as CSSProperties}
          />
          <img
            className="rocket-body"
            src={rocket}
            alt=""
            width={669}
            height={373}
            decoding="sync"
            draggable="false"
            onLoad={() => setIsRocketReady(true)}
          />
        </div>
      </div>
    </div>
  );
}
