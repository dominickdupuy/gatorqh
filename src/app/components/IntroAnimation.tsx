'use client';

import { type CSSProperties, useEffect, useState } from 'react';

const INTRO_DURATION_MS = 1450;
const LAUNCH_DELAY_MS = 0;
const FIRE_DELAY_MS = 0;
const IGNITION_DURATION_MS = 420;
const LAUNCH_DURATION_MS = 850;
const OVERLAY_FADE_DURATION_MS = 230;
const ROCKET_SRC = '/rocket.png';
const PIXEL_FIRES_SRC = '/pixelFires.png';

const smokePuffs = Array.from({ length: 22 }, (_, index) => index);
const padLights = Array.from({ length: 9 }, (_, index) => index);

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

// How far a touch has to travel, and how much wheel delta is needed, before
// a pull/scroll gesture counts as "launch" rather than an accidental twitch.
const TOUCH_PULL_THRESHOLD_PX = 28;
const WHEEL_TRIGGER_DELTA = 4;

export function IntroAnimation({ onVisibilityChange }: { onVisibilityChange?: (isVisible: boolean) => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [areIntroAssetsReady, setAreIntroAssetsReady] = useState(false);
  const [launchTriggered, setLaunchTriggered] = useState(false);
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

  // Rocket sits on the pad until the visitor scrolls/swipes down or taps the
  // prompt — it no longer launches itself.
  useEffect(() => {
    if (!isVisible || !areIntroAssetsReady || launchTriggered) {
      return;
    }

    const trigger = () => setLaunchTriggered(true);

    let touchStartY: number | null = null;

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > WHEEL_TRIGGER_DELTA) {
        event.preventDefault();
        trigger();
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchStartY === null) return;
      const currentY = event.touches[0]?.clientY;
      if (currentY === undefined) return;

      if (touchStartY - currentY > TOUCH_PULL_THRESHOLD_PX) {
        event.preventDefault();
        trigger();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [areIntroAssetsReady, isVisible, launchTriggered]);

  // The page itself stays put until launch — the pull/scroll gesture is
  // captured above and consumed as the trigger instead of moving the page.
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !areIntroAssetsReady || !launchTriggered || hasStarted) {
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
  }, [areIntroAssetsReady, hasStarted, isVisible, launchTriggered, onVisibilityChange]);

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
      onAnimationEnd={(event) => {
        if (event.currentTarget !== event.target) {
          return;
        }

        setIsVisible(false);
        onVisibilityChange?.(false);
      }}
    >
      <div className="intro-launch-stage" aria-hidden="true">
        <div className="intro-pad">
          <div className="intro-pad__mast intro-pad__mast--left" />
          <div className="intro-pad__mast intro-pad__mast--right" />
          <div className="intro-pad__glow" />
          <div className="intro-pad__deck">
            <div className="intro-pad__lights">
              {padLights.map((light) => (
                <span key={light} className="intro-pad__light" />
              ))}
            </div>
          </div>
          <div className="intro-pad__apron" />
          <div className="intro-pad__base" />
          <span className="intro-pad__stencil">LC-01</span>
        </div>

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

      {areIntroAssetsReady && !launchTriggered && (
        <div className="intro-launch-prompt" aria-hidden="true">
          <span className="intro-launch-prompt__label">SCROLL DOWN TO LAUNCH</span>
          <span className="intro-launch-prompt__chevrons">
            <span className="intro-launch-prompt__chevron" />
            <span className="intro-launch-prompt__chevron" />
          </span>
        </div>
      )}
    </div>
  );
}
