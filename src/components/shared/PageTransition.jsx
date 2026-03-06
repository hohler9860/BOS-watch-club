import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}
