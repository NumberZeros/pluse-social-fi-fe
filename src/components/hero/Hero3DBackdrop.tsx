import type { MotionValue } from 'framer-motion';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { ParticleBackground } from '../ParticleBackground';

interface Hero3DBackdropProps {
  scrollY?: MotionValue<number>;
}

export function Hero3DBackdrop({ scrollY }: Hero3DBackdropProps) {
  const reduceMotion = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const pointerXSpring = useSpring(pointerX, { stiffness: 120, damping: 20, mass: 0.6 });
  const pointerYSpring = useSpring(pointerY, { stiffness: 120, damping: 20, mass: 0.6 });

  const rotateY = useTransform(pointerXSpring, [-0.5, 0.5], ['-12deg', '12deg']);
  const rotateX = useTransform(pointerYSpring, [-0.5, 0.5], ['10deg', '-10deg']);

  const fallbackScroll = useMotionValue(0);
  const translateY = useTransform(scrollY ?? fallbackScroll, [0, 1], ['0%', '18%']);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      pointerX.set(nx);
      pointerY.set(ny);
    };

    const onLeave = () => {
      pointerX.set(0);
      pointerY.set(0);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [pointerX, pointerY]);

  if (reduceMotion) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 mesh-gradient-lens opacity-70" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0 mesh-gradient-lens opacity-60" />
      <ParticleBackground opacity={0.18} />

      <motion.div
        className="absolute inset-0 hero-3d-root"
        style={{ rotateX, rotateY, y: translateY }}
      >
        {/* Depth grid */}
        <div className="absolute inset-x-[-20%] bottom-[-20%] h-[60%] hero-grid" />

        {/* Luminous orb */}
        <div className="absolute right-[-10%] top-[10%] w-[700px] h-[700px] hero-orb" />

        {/* Solana ribbons */}
        <div className="absolute right-[6%] top-[18%] w-[520px] h-[520px] hero-ribbon" />
        <div className="absolute right-[14%] top-[26%] w-[360px] h-[360px] hero-ribbon hero-ribbon--alt" />

        {/* Shards */}
        <div className="hero-shard hero-shard-a" />
        <div className="hero-shard hero-shard-b" />
        <div className="hero-shard hero-shard-c" />
        <div className="hero-shard hero-shard-d" />

        {/* Rings */}
        <motion.div className="absolute right-[8%] top-[22%] w-[560px] h-[560px] hero-ring" />
        <motion.div className="absolute right-[18%] top-[34%] w-[340px] h-[340px] hero-ring hero-ring--thin" />
      </motion.div>

      {/* Edge vignette to keep text readable */}
      <div className="absolute inset-0 hero-vignette" />
    </div>
  );
}
