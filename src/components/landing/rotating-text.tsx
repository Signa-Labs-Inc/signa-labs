'use client';

import { useState, useEffect, useRef } from 'react';

const ROLES = [
  'Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Problem Solver',
  'SQL Developer',
];

const INTERVAL_MS = 2500;

export function RotatingText() {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const innerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      innerTimerRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % ROLES.length);
        setIsAnimating(false);
      }, 300);
    }, INTERVAL_MS);

    return () => {
      clearInterval(timer);
      if (innerTimerRef.current) clearTimeout(innerTimerRef.current);
    };
  }, []);

  return (
    <span className="relative inline-flex h-[1.2em] items-center overflow-hidden align-bottom">
      <span
        className="inline-block bg-linear-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent transition-all duration-300 ease-in-out"
        style={{
          transform: isAnimating ? 'translateY(-100%)' : 'translateY(0)',
          opacity: isAnimating ? 0 : 1,
        }}
      >
        {ROLES[index]}
      </span>
    </span>
  );
}
