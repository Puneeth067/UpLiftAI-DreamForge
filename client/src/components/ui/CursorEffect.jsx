import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CursorEffect = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isHovering, setIsHovering] = useState(false);
  const [interactiveElements, setInteractiveElements] = useState([]);
  const observerRef = useRef(null);

  const smoothMouseX = useSpring(mouseX, { damping: 15, stiffness: 250 });
  const smoothMouseY = useSpring(mouseY, { damping: 15, stiffness: 250 });

  const handleMouseMove = useCallback(
    (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const isOverInteractive = interactiveElements.some((el) =>
        el.contains(e.target)
      );
      setIsHovering(isOverInteractive);
    },
    [mouseX, mouseY, interactiveElements]
  );

  useEffect(() => {
    const updateInteractiveElements = () => {
      const elements = document.querySelectorAll(
        'button, a, input, select, textarea, [role="button"]'
      );
      setInteractiveElements(Array.from(elements));
    };

    updateInteractiveElements();

    observerRef.current = new MutationObserver(updateInteractiveElements);
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const isDarkTheme = useMemo(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, []);

  const cursorGradients = useMemo(
    () => ({
      primary: {
        background: `radial-gradient(
          circle at center, 
          ${isDarkTheme 
            ? 'rgba(128, 90, 213, 0.4)' 
            : 'rgba(147, 112, 219, 0.3)'} 0%, 
          ${isDarkTheme 
            ? 'rgba(128, 90, 213, 0.2)' 
            : 'rgba(147, 112, 219, 0.15)'} 50%, 
          ${isDarkTheme 
            ? 'rgba(128, 90, 213, 0)' 
            : 'rgba(147, 112, 219, 0)'} 70%
        )`,
        filter: `blur(80px) ${
          isDarkTheme
            ? 'drop-shadow(0px 0px 40px rgba(128, 90, 213, 0.6))'
            : 'drop-shadow(0px 0px 40px rgba(147, 112, 219, 0.5))'
        }`,
        width: isHovering ? '450px' : '400px',
        height: isHovering ? '450px' : '400px',
      },
    }),
    [isHovering, isDarkTheme]
  );

  const sparkleEffect = useMemo(() => ({
    position: 'absolute',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: `linear-gradient(
      135deg, 
      ${isDarkTheme ? 'rgba(128, 90, 213, 0.8)' : 'rgba(147, 112, 219, 0.7)'}, 
      ${isDarkTheme ? 'rgba(106, 90, 205, 0.6)' : 'rgba(138, 43, 226, 0.5)'}
    )`,
    animation: 'sparkle 1.2s ease-in-out infinite',
    pointerEvents: 'none',
    mixBlendMode: 'screen',
    boxShadow: isDarkTheme 
      ? '0 0 10px rgba(128, 90, 213, 0.4)' 
      : '0 0 10px rgba(147, 112, 219, 0.3)',
  }));

  const sparkleAnimation = `
    @keyframes sparkle {
      0% { 
        transform: translate(-30px, -30px) scale(0.7) rotate(0deg); 
        opacity: 0.7; 
      }
      50% { 
        transform: translate(0px, 0px) scale(1.2) rotate(180deg); 
        opacity: 1; 
      }
      100% { 
        transform: translate(30px, 30px) scale(0.7) rotate(360deg); 
        opacity: 0.7; 
      }
    }
  `;

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = sparkleAnimation;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <>
      {/* Cursor Glow Effect */}
      <motion.div
        style={{
          position: 'fixed',
          x: smoothMouseX,
          y: smoothMouseY,
          translateX: '-50%',
          translateY: '-50%',
          ...cursorGradients.primary,
          opacity: isHovering ? 0.9 : 0.5,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'all 0.3s ease-out',
        }}
      />

      {/* Sparkle Effects */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'fixed',
            x: smoothMouseX,
            y: smoothMouseY,
            translateX: `-${Math.random() * 50}%`,
            translateY: `-${Math.random() * 50}%`,
            ...sparkleEffect,
          }}
        />
      ))}
    </>
  );
};

export default React.memo(CursorEffect);