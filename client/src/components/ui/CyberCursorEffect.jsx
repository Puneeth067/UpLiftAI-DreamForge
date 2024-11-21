import { useEffect, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import "../../styles/CyberCursorEffect.css"; // Custom CSS for styling

const CyberCursorEffect = () => {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const cursorSpringX = useSpring(cursorX, { damping: 25, stiffness: 300 });
  const cursorSpringY = useSpring(cursorY, { damping: 25, stiffness: 300 });

  const cursorRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const interactiveElements = document.querySelectorAll("button, a, input");
    interactiveElements.forEach((el) =>
      el.addEventListener("mouseenter", () => cursorRef.current.classList.add("hover"))
    );
    interactiveElements.forEach((el) =>
      el.addEventListener("mouseleave", () => cursorRef.current.classList.remove("hover"))
    );

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      interactiveElements.forEach((el) =>
        el.removeEventListener("mouseenter", () => cursorRef.current.classList.add("hover"))
      );
      interactiveElements.forEach((el) =>
        el.removeEventListener("mouseleave", () => cursorRef.current.classList.remove("hover"))
      );
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      ref={cursorRef}
      className="cyber-cursor"
      style={{
        translateX: cursorSpringX,
        translateY: cursorSpringY,
      }}
    >
      <div className="cursor-core" />
    </motion.div>
  );
};

export default CyberCursorEffect;
