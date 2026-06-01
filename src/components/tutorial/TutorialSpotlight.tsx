/** Öğretici — menü / buton spotlight overlay */

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  tutorialNavSelector,
  type TutorialNavTarget,
} from '../../tutorial/tutorialNavTargets';
import './TutorialSpotlight.css';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TutorialSpotlightProps {
  target: TutorialNavTarget | null;
  message: string;
  visible: boolean;
}

function measureTarget(selector: string): SpotlightRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const pad = 6;
  return {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };
}

export function TutorialSpotlight({
  target,
  message,
  visible,
}: TutorialSpotlightProps) {
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  const update = useCallback(() => {
    if (!target || !visible) {
      setRect(null);
      return;
    }
    setRect(measureTarget(tutorialNavSelector(target)));
  }, [target, visible]);

  useEffect(() => {
    update();
    if (!visible || !target) return;

    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);

    const interval = window.setInterval(update, 400);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      window.clearInterval(interval);
    };
  }, [update, visible, target]);

  if (!visible || !target || !rect) return null;

  return createPortal(
    <div className="tutorial-spotlight-root" aria-hidden>
      <div className="tutorial-spotlight-backdrop" />
      <div
        className="tutorial-spotlight-hole"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }}
      />
      <div
        className="tutorial-spotlight-tooltip"
        style={{
          top: Math.min(rect.top + rect.height + 12, window.innerHeight - 120),
          left: Math.max(12, Math.min(rect.left, window.innerWidth - 320)),
        }}
      >
        <p>{message}</p>
      </div>
    </div>,
    document.body,
  );
}
