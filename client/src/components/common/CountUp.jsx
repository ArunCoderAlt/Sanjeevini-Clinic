import React, { useEffect, useRef } from 'react';
import { useInView, animate } from 'framer-motion';

/**
 * Parses numeric strings like "15+", "10,000+", "₹500", "99.5%"
 * into target value, prefix, suffix, and formatting options.
 */
const parseNumber = (val) => {
  if (typeof val === 'number') {
    return { target: val, prefix: '', suffix: '', hasCommas: false };
  }
  const str = String(val ?? '').trim();
  const match = str.match(/^([^\d]*)([\d,.]+)([^\d]*)$/);
  if (!match) {
    return { target: 0, prefix: '', suffix: str, hasCommas: false };
  }
  const prefix = match[1] || '';
  const numStr = match[2] || '0';
  const suffix = match[3] || '';
  const hasCommas = numStr.includes(',');
  const target = parseFloat(numStr.replace(/,/g, '')) || 0;
  return { target, prefix, suffix, hasCommas };
};

const CountUp = ({
  value,
  duration = 2,
  delay = 0,
  className = '',
  decimals = 0
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const { target, prefix, suffix, hasCommas } = parseNumber(value);

  useEffect(() => {
    if (!isInView || !ref.current) return;

    // Smooth cubic-bezier transition that accelerates then gently settles at target
    const controls = animate(0, target, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate(latest) {
        if (!ref.current) return;
        const rounded = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest);
        const formatted =
          hasCommas || Number(rounded) >= 1000
            ? Number(rounded).toLocaleString()
            : rounded;

        ref.current.textContent = `${prefix}${formatted}${suffix}`;
      },
      onComplete() {
        if (!ref.current) return;
        const formatted =
          hasCommas || target >= 1000
            ? target.toLocaleString()
            : decimals > 0
            ? target.toFixed(decimals)
            : target;
        ref.current.textContent = `${prefix}${formatted}${suffix}`;
      }
    });

    return () => controls.stop();
  }, [isInView, target, duration, delay, prefix, suffix, hasCommas, decimals]);

  // Initial SSR / pre-animation display
  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
};

export { CountUp };
export default CountUp;
