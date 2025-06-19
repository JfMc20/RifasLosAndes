import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface AnimatedCounterProps {
  from?: number;
  to: number;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ from = 0, to, className }) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString('es-ES'));

  useEffect(() => {
    const controls = animate(count, to, {
      duration: 2,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [from, to, count]);

  return <motion.span className={className}>{rounded}</motion.span>;
};

export default AnimatedCounter;
