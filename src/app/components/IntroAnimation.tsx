'use client';

import { type CSSProperties, useEffect, useState } from 'react';

const INTRO_DURATION_MS = 3300;
const LAUNCH_DELAY_MS = 0;
const FIRE_DELAY_MS = 0;
const IGNITION_DURATION_MS = 1050;
const LAUNCH_DURATION_MS = 1950;
const OVERLAY_FADE_DURATION_MS = 520;
const ROCKET_SRC = '/rocket.png';
const PIXEL_FIRES_SRC = '/pixelFires.png';

const smokePuffs = Array.from({ length: 22 }, (_, index) => index);

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

    Promise.all([preloadImage(ROCKET_SRC), preloadImage(PIXEL_FIRES_SRC)]).then(() => {
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
      style={
        {
          '--intro-duration': `${INTRO_DURATION_MS}ms`,
          '--launch-delay': `${LAUNCH_DELAY_MS}ms`,
          '--fire-delay': `${FIRE_DELAY_MS}ms`,
          '--ignition-duration': `${IGNITION_DURATION_MS}ms`,
          '--launch-duration': `${LAUNCH_DURATION_MS}ms`,
          '--overlay-fade-duration': `${OVERLAY_FADE_DURATION_MS}ms`,
          '--rocket-flame-sprite': `url(${PIXEL_FIRES_SRC})`,
        } as CSSProperties
      }
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.currentTarget !== event.target) {
          return;
        }

        setIsVisible(false);
        onVisibilityChange?.(false);
      }}
    >
      <div className="intro-launch-stage">
        <div className="intro-smoke-layer">
          {smokePuffs.map((puff) => (
            <span key={puff} className="intro-smoke-puff" />
          ))}
        </div>

        <div className="intro-rocket-wrapper">
          <div className="intro-rocket">
            <div className="intro-rocket__body-frame">
              <img
                className="intro-rocket__body"
                src={ROCKET_SRC}
                alt=""
                width={669}
                height={373}
                decoding="async"
                loading="eager"
                draggable="false"
              />
            </div>
            <div className="intro-rocket__fire" />
          </div>
        </div>
      </div>
    </div>
  );
}
