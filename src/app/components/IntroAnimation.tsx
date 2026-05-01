'use client';

import { type CSSProperties, useEffect, useState } from 'react';
import pixelFires from './pixelFires.png';
import rocket from './rocket.png';

const INTRO_DURATION_MS = 2900;

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();

    image.onload = () => {
      if ('decode' in image) {
        image.decode().then(() => resolve()).catch(() => resolve());
        return;
      }

      resolve();
    };
    image.onerror = () => resolve();
    image.src = src;
  });
}

export function IntroAnimation({ onVisibilityChange }: { onVisibilityChange?: (isVisible: boolean) => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [areIntroAssetsReady, setAreIntroAssetsReady] = useState(false);
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
    let isMounted = true;

    Promise.all([preloadImage(rocket), preloadImage(pixelFires)]).then(() => {
      if (isMounted) {
        setAreIntroAssetsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !areIntroAssetsReady || hasStarted) {
      return;
    }

    let startFrame = 0;
    const settleFrame = window.requestAnimationFrame(() => {
      startFrame = window.requestAnimationFrame(() => {
        setHasStarted(true);
        onVisibilityChange?.(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(settleFrame);
      window.cancelAnimationFrame(startFrame);
    };
  }, [areIntroAssetsReady, hasStarted, isVisible, onVisibilityChange]);

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
      className={`intro-animation ${areIntroAssetsReady ? 'intro-animation--ready' : ''} ${
        hasStarted ? 'intro-animation--playing' : ''
      }`}
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
            decoding="async"
            draggable="false"
          />
        </div>
      </div>
    </div>
  );
}
