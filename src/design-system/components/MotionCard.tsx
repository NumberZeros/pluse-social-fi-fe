import { motion } from 'framer-motion';
import { Card } from './Card.tsx';

/** Framer-motion wrapper around `<Card>` for animated card surfaces. */
export const MotionCard = motion.create(Card);
